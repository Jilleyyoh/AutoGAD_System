<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuestionnaireSetting extends Model
{
    /** @use HasFactory<\Database\Factories\QuestionnaireSettingFactory> */
    use HasFactory;
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'setting_key',
        'setting_value',
        'description',
        'version',
    ];
    
    /**
     * Get a setting value by key.
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public static function getValue(string $key, $default = null)
    {
        $setting = self::where('setting_key', $key)->first();
        return $setting ? $setting->setting_value : $default;
    }
    
    /**
     * Set a setting value by key.
     *
     * @param string $key
     * @param mixed $value
     * @param string|null $description
     * @return QuestionnaireSetting
     */
    public static function setValue(string $key, $value, ?string $description = null): QuestionnaireSetting
    {
        $setting = self::firstOrNew(['setting_key' => $key]);
        $setting->setting_value = $value;
        
        if ($description) {
            $setting->description = $description;
        }
        
        $setting->save();
        return $setting;
    }
}
