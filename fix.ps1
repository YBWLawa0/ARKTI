$file = ".\src\pages\ResultPage.vue"
$content = Get-Content -Path $file -Raw

$oldTract = @"
              <div 
                class="absolute h-full rounded-full transition-all duration-1000 ease-out"
                :style="{ 
                  width: result.scores[trait.id].dominant === trait.leftCode ? \`${result.scores[trait.id].percentage}%\` : \`${result.scores[trait.id].percentage}%\`,
                  left: result.scores[trait.id].dominant === trait.leftCode ? '0' : 'auto',
                  right: result.scores[trait.id].dominant === trait.rightCode ? '0' : 'auto',
                  backgroundColor: trait.color 
                }"
              ></div>
"@

$elegantFill = @"
              <div 
                class="absolute h-full rounded-full transition-all duration-1000 ease-out"
                :style="{ 
                  width: result.scores[trait.id].dominant === trait.leftCode ? `${getHandlePosition(trait.id, trait.leftCode)}%` : `${100 - getHandlePosition(trait.id, trait.leftCode)}%`,
                  left: result.scores[trait.id].dominant === trait.leftCode ? '0' : 'auto',
                  right: result.scores[trait.id].dominant === trait.rightCode ? '0' : 'auto',
                  backgroundColor: trait.color 
                }"
              ></div>
"@

$content = $content.Replace($oldTract, $elegantFill)
Set-Content -Path $file -Value $content
