$filePath = Resolve-Path 'ui.html'
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

$old = "      function updateTOCTabState(slides) {`r`n        const tocBtn = document.getElementById('tab-btn-toc');`r`n        if (!tocBtn) return;`r`n        const hasSlides = slides && slides.length > 0;`r`n        if (hasSlides) {`r`n          tocBtn.classList.remove('disabled-clickable');`r`n          tocBtn.removeAttribute('data-tooltip');`r`n        } else {`r`n          tocBtn.classList.add('disabled-clickable');`r`n          tocBtn.setAttribute('data-tooltip', 'Number your slides first " + [char]0x2014 + " then generate the TOC! `u{1F3AF}');`r`n          // If currently on toc tab, kick back to numbering`r`n          const tocPanel = document.getElementById('panel-toc');`r`n          if (tocPanel && tocPanel.classList.contains('active')) {`r`n            switchTab('numbering');`r`n          }`r`n        }`r`n      }"

$new = "      function updateTOCTabState(slides) {`r`n        const tocBtn = document.getElementById('tab-btn-toc');`r`n        if (!tocBtn) return;`r`n        const hasSlides = slides && slides.length > 0;`r`n        const styleBtn = document.getElementById('slide-number-settings');`r`n        const fixBtn   = document.getElementById('refresh-numbers');`r`n        const clearBtn = document.getElementById('remove-all-numbers');`r`n        if (hasSlides) {`r`n          tocBtn.classList.remove('disabled-clickable');`r`n          tocBtn.removeAttribute('data-tooltip');`r`n          if (styleBtn) styleBtn.disabled = false;`r`n          if (fixBtn)   fixBtn.disabled   = false;`r`n          if (clearBtn) clearBtn.disabled = false;`r`n        } else {`r`n          tocBtn.classList.add('disabled-clickable');`r`n          tocBtn.setAttribute('data-tooltip', 'Number your slides first, then generate the TOC!');`r`n          if (styleBtn) styleBtn.disabled = true;`r`n          if (fixBtn)   fixBtn.disabled   = true;`r`n          if (clearBtn) clearBtn.disabled = true;`r`n          const tocPanel = document.getElementById('panel-toc');`r`n          if (tocPanel && tocPanel.classList.contains('active')) {`r`n            switchTab('numbering');`r`n          }`r`n        }`r`n      }"

if ($content.Contains($old)) {
    $content = $content.Replace($old, $new)
    [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
    Write-Host "SUCCESS: function replaced"
} else {
    Write-Host "NOT FOUND: trying fallback search..."
    # Show chars around the relevant line to debug
    $idx = $content.IndexOf("function updateTOCTabState")
    if ($idx -ge 0) {
        Write-Host "Found function at index $idx"
        Write-Host $content.Substring($idx, 500)
    } else {
        Write-Host "Function not found at all"
    }
}
