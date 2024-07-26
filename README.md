# fixr-code-change-and-pr

# endpoint 
``a/api/make-changes``

## request body example

````{
"codeChanges": [
{
"filePath": "app/Models/Contact.php",
"content": "<?php\n\nnamespace App\\Models;\n\nuse Illuminate\\Database\\Eloquent\\Factories\\HasFactory;\nuse Illuminate\\Database\\Eloquent\\Model;\n\nclass Contact extends Model\n{\n    use HasFactory;\n\n    protected $table = 'contact';\n\n    /**\n     * @return string\n     */\n    public function getRouteKeyName()\n    {\n        return 'id';\n    }\n\n    protected $fillable = [\n        'name',\n        'email',\n        'gender',\n        'content'\n    ];\n}"
}
],
"commitMessage": "Automated code changes",
"githubToken": "github_pat_token",
"owner": "blessingk",
"repo": "contact-form",
"baseBranch": "main",
"featureBranch": "feature/automated-changes"
}```