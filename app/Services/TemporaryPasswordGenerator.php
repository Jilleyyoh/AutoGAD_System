<?php

namespace App\Services;

use Illuminate\Support\Str;
use InvalidArgumentException;

class TemporaryPasswordGenerator
{
    public function generate(int $length = 10): string
    {
        if ($length < 4) {
            throw new InvalidArgumentException('Temporary password length must be at least 4 characters.');
        }

        $characters = [
            $this->randomCharacter('ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
            $this->randomCharacter('abcdefghijklmnopqrstuvwxyz'),
            $this->randomCharacter('0123456789'),
            $this->randomCharacter('!@#$%^&*()-_=+[]{};:,.?'),
        ];

        $remainingLength = $length - count($characters);

        if ($remainingLength > 0) {
            $characters = array_merge($characters, str_split(Str::random($remainingLength)));
        }

        shuffle($characters);

        return implode('', $characters);
    }

    private function randomCharacter(string $pool): string
    {
        return $pool[random_int(0, strlen($pool) - 1)];
    }
}