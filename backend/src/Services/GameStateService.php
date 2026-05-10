<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AuthUser;
use RuntimeException;

final class GameStateService
{
    private const BASE_FARM_SLOTS = 1;
    private const MAX_MONSTERS = 50;
    private const CARE_DECAY = [
        'hunger' => 1.0,
        'happiness' => 0.5,
        'cleanliness' => 0.3,
        'energy' => 2.0,
    ];

    public function __construct(
        private readonly string $gameSlug,
        private readonly string $gameName
    ) {
    }

    public function initialState(): array
    {
        return [
            'game_slug' => $this->gameSlug,
            'game_name' => $this->gameName,
            'schema_version' => 2,
            'farm' => [
                'gold' => 100,
                'prestige' => 0,
                'level' => 1,
                'maxMonsters' => self::BASE_FARM_SLOTS,
                'monsters' => [$this->starterMonster()],
                'lastSaved' => $this->nowMs(),
                'upgrades' => [],
            ],
            'currentView' => 'farm',
            'created_at' => gmdate('Y-m-d H:i:s'),
        ];
    }

    public function applyIntent(array $state, string $intent, array $payload): array
    {
        $state = $this->withDefaults($state);

        return match ($intent) {
            'initialize', 'load' => $state,
            'save' => $this->markSaved($state),
            'tick' => $this->tick($state, $payload),
            'feed_monster' => $this->feedMonster($state, $payload),
            'clean_monster' => $this->cleanMonster($state, $payload),
            'play_with_monster' => $this->playWithMonster($state, $payload),
            'start_training' => $this->startTraining($state, $payload),
            'complete_training' => $this->completeTraining($state, $payload, false),
            'enter_contest' => $this->enterContest($state, $payload),
            'expand_farm' => $this->expandFarm($state),
            'add_gold' => $this->addGold($state, $payload),
            'spend_gold' => $this->spendGoldIntent($state, $payload),
            'add_prestige' => $this->addPrestigeIntent($state, $payload),
            'add_monster' => $this->addMonster($state, $payload),
            'remove_monster' => $this->removeMonster($state, $payload),
            'update_monster' => $this->updateMonster($state, $payload),
            default => throw new RuntimeException('Unsupported game intent: ' . $intent),
        };
    }

    public function response(array $save, AuthUser $user): array
    {
        return [
            'user' => $user->toArray(),
            'save' => [
                'id' => $save['id'],
                'slot' => $save['save_slot'],
                'state' => $this->withDefaults($save['state']),
                'metadata' => $save['metadata'],
                'version' => $save['version'],
                'status' => $save['status'],
                'created_at' => $save['created_at'],
                'updated_at' => $save['updated_at'],
            ],
        ];
    }

    private function tick(array $state, array $payload): array
    {
        $deltaTime = $this->number($payload['deltaTime'] ?? 1000, 'deltaTime');
        $minutes = max(0, $deltaTime) / 60000;

        foreach ($state['farm']['monsters'] as $index => $monster) {
            $state['farm']['monsters'][$index]['hunger'] = max(
                0,
                (float) $monster['hunger'] - (self::CARE_DECAY['hunger'] * $minutes)
            );
            $state['farm']['monsters'][$index]['happiness'] = max(
                0,
                (float) $monster['happiness'] - (self::CARE_DECAY['happiness'] * $minutes)
            );
            $state['farm']['monsters'][$index]['cleanliness'] = max(
                0,
                (float) $monster['cleanliness'] - (self::CARE_DECAY['cleanliness'] * $minutes)
            );
            $state['farm']['monsters'][$index]['energy'] = min(
                100,
                (float) $monster['energy'] + (self::CARE_DECAY['energy'] * $minutes)
            );

            if (
                ($monster['isTraining'] ?? false)
                && isset($monster['trainingEnd'])
                && (int) $monster['trainingEnd'] <= $this->nowMs()
            ) {
                $state = $this->completeTraining($state, ['monsterId' => $monster['id']], true);
            }
        }

        return $this->markSaved($state);
    }

    private function feedMonster(array $state, array $payload): array
    {
        $index = $this->monsterIndex($state, $payload);
        $state = $this->spendGold($state, 20);
        $monster = $state['farm']['monsters'][$index];
        $state['farm']['monsters'][$index]['hunger'] = min(100, (float) $monster['hunger'] + 30);
        $state['farm']['monsters'][$index]['happiness'] = min(100, (float) $monster['happiness'] + 10);
        $state['farm']['monsters'][$index]['lastFed'] = $this->nowMs();
        return $this->markSaved($state);
    }

    private function cleanMonster(array $state, array $payload): array
    {
        $index = $this->monsterIndex($state, $payload);
        $state = $this->spendGold($state, 30);
        $monster = $state['farm']['monsters'][$index];
        $state['farm']['monsters'][$index]['cleanliness'] = 100;
        $state['farm']['monsters'][$index]['happiness'] = min(100, (float) $monster['happiness'] + 5);
        $state['farm']['monsters'][$index]['lastCleaned'] = $this->nowMs();
        return $this->markSaved($state);
    }

    private function playWithMonster(array $state, array $payload): array
    {
        $index = $this->monsterIndex($state, $payload);
        $monster = $state['farm']['monsters'][$index];
        if ((float) $monster['energy'] < 20) {
            throw new RuntimeException('Monster does not have enough energy.');
        }

        $state['farm']['monsters'][$index]['happiness'] = min(100, (float) $monster['happiness'] + 20);
        $state['farm']['monsters'][$index]['energy'] = max(0, (float) $monster['energy'] - 20);
        $state['farm']['monsters'][$index]['lastPlayed'] = $this->nowMs();
        return $this->markSaved($state);
    }

    private function startTraining(array $state, array $payload): array
    {
        $index = $this->monsterIndex($state, $payload);
        $training = $payload['trainingType'] ?? null;
        if (!is_array($training) || !isset($training['id'], $training['cost'], $training['duration'], $training['effects'])) {
            throw new RuntimeException('Training type is required.');
        }
        if ($state['farm']['monsters'][$index]['isTraining']) {
            throw new RuntimeException('Monster is already training.');
        }

        $state = $this->spendGold($state, (int) $training['cost']);
        $state['farm']['monsters'][$index]['isTraining'] = true;
        $state['farm']['monsters'][$index]['trainingType'] = $training;
        $state['farm']['monsters'][$index]['trainingEnd'] = $this->nowMs() + (int) $training['duration'];
        return $this->markSaved($state);
    }

    private function completeTraining(array $state, array $payload, bool $allowEarly): array
    {
        $index = $this->monsterIndex($state, $payload);
        $monster = $state['farm']['monsters'][$index];
        if (!($monster['isTraining'] ?? false) || !isset($monster['trainingType'])) {
            throw new RuntimeException('Monster is not training.');
        }
        if (!$allowEarly && isset($monster['trainingEnd']) && (int) $monster['trainingEnd'] > $this->nowMs()) {
            throw new RuntimeException('Training is not complete yet.');
        }

        $effects = $monster['trainingType']['effects'] ?? [];
        foreach (['hp', 'attack', 'defense', 'speed', 'special'] as $stat) {
            if (isset($effects[$stat])) {
                $state['farm']['monsters'][$index]['stats'][$stat] =
                    (int) $state['farm']['monsters'][$index]['stats'][$stat] + (int) $effects[$stat];
            }
        }

        $state['farm']['monsters'][$index]['isTraining'] = false;
        unset($state['farm']['monsters'][$index]['trainingType'], $state['farm']['monsters'][$index]['trainingEnd']);
        $state['farm']['monsters'][$index]['experience'] = (int) $monster['experience'] + 10;
        return $this->markSaved($state);
    }

    private function enterContest(array $state, array $payload): array
    {
        $this->monsterIndex($state, $payload);
        $contest = $payload['contestType'] ?? null;
        if (!is_array($contest) || !isset($contest['rewards']['gold'], $contest['rewards']['prestige'])) {
            throw new RuntimeException('Contest type is required.');
        }

        $state['farm']['gold'] = (int) $state['farm']['gold'] + (int) $contest['rewards']['gold'];
        return $this->addPrestige($state, (int) $contest['rewards']['prestige']);
    }

    private function expandFarm(array $state): array
    {
        $expansionCost = ((int) $state['farm']['maxMonsters'] - self::BASE_FARM_SLOTS + 1) * 500;
        $state = $this->spendGold($state, $expansionCost);
        $state['farm']['maxMonsters'] = (int) $state['farm']['maxMonsters'] + 1;
        return $this->markSaved($state);
    }

    private function addGold(array $state, array $payload): array
    {
        $state['farm']['gold'] = (int) $state['farm']['gold'] + (int) $this->number($payload['amount'] ?? 0, 'amount');
        return $this->markSaved($state);
    }

    private function spendGoldIntent(array $state, array $payload): array
    {
        return $this->markSaved($this->spendGold($state, (int) $this->number($payload['amount'] ?? 0, 'amount')));
    }

    private function addPrestigeIntent(array $state, array $payload): array
    {
        return $this->addPrestige($state, (int) $this->number($payload['amount'] ?? 0, 'amount'));
    }

    private function addMonster(array $state, array $payload): array
    {
        $monster = $payload['monster'] ?? null;
        if (!is_array($monster)) {
            throw new RuntimeException('Monster payload is required.');
        }
        if (count($state['farm']['monsters']) >= (int) $state['farm']['maxMonsters']) {
            throw new RuntimeException('Farm is full.');
        }

        $state['farm']['monsters'][] = $monster;
        return $this->markSaved($state);
    }

    private function removeMonster(array $state, array $payload): array
    {
        $monsterId = $this->monsterId($payload);
        $state['farm']['monsters'] = array_values(array_filter(
            $state['farm']['monsters'],
            fn (array $monster): bool => ($monster['id'] ?? null) !== $monsterId
        ));
        return $this->markSaved($state);
    }

    private function updateMonster(array $state, array $payload): array
    {
        $index = $this->monsterIndex($state, $payload);
        $updates = $payload['updates'] ?? null;
        if (!is_array($updates)) {
            throw new RuntimeException('Monster updates are required.');
        }

        $state['farm']['monsters'][$index] = array_replace_recursive($state['farm']['monsters'][$index], $updates);
        return $this->markSaved($state);
    }

    private function spendGold(array $state, int $amount): array
    {
        if ($amount < 0) {
            throw new RuntimeException('Gold amount cannot be negative.');
        }
        if ((int) $state['farm']['gold'] < $amount) {
            throw new RuntimeException('Not enough gold.');
        }

        $state['farm']['gold'] = (int) $state['farm']['gold'] - $amount;
        return $state;
    }

    private function addPrestige(array $state, int $amount): array
    {
        $newPrestige = (int) $state['farm']['prestige'] + $amount;
        $newLevel = (int) floor($newPrestige / 100) + 1;

        $state['farm']['prestige'] = $newPrestige;
        $state['farm']['level'] = $newLevel;
        $state['farm']['maxMonsters'] = min($newLevel, self::MAX_MONSTERS);
        return $this->markSaved($state);
    }

    private function markSaved(array $state): array
    {
        $state['farm']['lastSaved'] = $this->nowMs();
        return $state;
    }

    private function monsterIndex(array $state, array $payload): int
    {
        $monsterId = $this->monsterId($payload);
        foreach ($state['farm']['monsters'] as $index => $monster) {
            if (($monster['id'] ?? null) === $monsterId) {
                return (int) $index;
            }
        }

        throw new RuntimeException('Monster not found.');
    }

    private function monsterId(array $payload): string
    {
        $monsterId = $payload['monsterId'] ?? null;
        if (!is_string($monsterId) || trim($monsterId) === '') {
            throw new RuntimeException('Monster id is required.');
        }

        return $monsterId;
    }

    private function withDefaults(array $state): array
    {
        return array_replace_recursive($this->initialState(), $state);
    }

    private function number(mixed $value, string $name): float
    {
        if (!is_int($value) && !is_float($value)) {
            throw new RuntimeException($name . ' must be numeric.');
        }

        return (float) $value;
    }

    private function nowMs(): int
    {
        return (int) floor(microtime(true) * 1000);
    }

    private function starterMonster(): array
    {
        $species = [
            'id' => 'flamepup',
            'name' => 'Flamepup',
            'element' => 'fire',
            'emoji' => '🔥',
            'rarity' => 'common',
            'baseStats' => ['hp' => 45, 'attack' => 55, 'defense' => 30, 'speed' => 50, 'special' => 40],
            'evolvesTo' => ['blazehound', 'infernodrake'],
        ];

        return [
            'id' => 'monster_' . $this->nowMs(),
            'species' => $species,
            'name' => 'Flamepup',
            'level' => 1,
            'experience' => 0,
            'stats' => $species['baseStats'],
            'element' => 'fire',
            'personality' => [
                'id' => 'playful',
                'name' => 'Playful',
                'emoji' => '😄',
                'effects' => [
                    'happinessGain' => 1.5,
                    'energyLoss' => 1.2,
                    'trainingBonus' => 0.1,
                ],
            ],
            'bornAt' => $this->nowMs(),
            'lastFed' => $this->nowMs(),
            'lastCleaned' => $this->nowMs(),
            'lastPlayed' => $this->nowMs(),
            'hunger' => 100,
            'happiness' => 100,
            'cleanliness' => 100,
            'energy' => 100,
            'isTraining' => false,
            'evolutionStage' => 0,
            'prestige' => 0,
        ];
    }
}
