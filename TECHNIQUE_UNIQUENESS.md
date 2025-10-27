# Technique Uniqueness Guide

## How Each Technique Should Be UNIQUELY Identifiable:

### 1. Zero-Width (Most Distinctive)
**Unique Pattern:** Contains invisible Unicode characters
- **Signature:** \u200B, \u200C, \u200D, \uFEFF
- **Detection:** Check for these specific chars
- **False Positives:** Nearly impossible
- **Confidence:** 95%+ if found

### 2. Whitespace
**Unique Pattern:** Double/triple spaces or tabs
- **Signature:** Multiple consecutive spaces (`  ` or more)
- **Detection:** Regex `/  +/g`
- **False Positives:** Possible (accidental double spaces)
- **Confidence:** 70-85% based on count

### 3. Homoglyph
**Unique Pattern:** Cyrillic/Greek letters that look like Latin
- **Signature:** 'а' (Cyrillic) vs 'a' (Latin), 'с' vs 'c', 'е' vs 'e'
- **Detection:** Check for Unicode range \u0400-\u04FF (Cyrillic)
- **False Positives:** Low (unless actually Russian text)
- **Confidence:** 80-90%

### 4. Unicode Normalization
**Unique Pattern:** Combining diacritical marks
- **Signature:** é (NFC) vs é (NFD - e + combining acute)
- **Detection:** Text.normalize('NFC') !== Text.normalize('NFD')
- **False Positives:** Medium (legitimate accented text)
- **Confidence:** 60-75%

### 5. Synonym
**Unique Pattern:** Unusual synonym density
- **Signature:** Many words from synonym map (good/great/excellent clustered)
- **Detection:** Count synonym words > 15% of total
- **False Positives:** Medium (creative writing)
- **Confidence:** 50-70%

### 6. Frequency
**Unique Pattern:** Character frequency anomalies + double spaces
- **Signature:** Double spaces at specific intervals
- **Detection:** Statistical analysis + double space pattern
- **False Positives:** High (overlaps with whitespace)
- **Confidence:** 40-60%

### 7. Punctuation
**Unique Pattern:** Excessive punctuation substitution
- **Signature:** Many apostrophes, unusual comma/semicolon ratio
- **Detection:** Count ', vs ", ; vs , ratios
- **False Positives:** Medium (informal writing)
- **Confidence:** 50-65%

### 8. Invisible Ink
**Unique Pattern:** HTML color variations
- **Signature:** <span style="color:#..."> with subtle differences
- **Detection:** Check for HTML tags with color styling
- **False Positives:** Low (plain text won't have)
- **Confidence:** 85-95% if HTML present

## Priority Detection Order:
1. Zero-Width (most unique)
2. Invisible Ink (HTML check)
3. Homoglyph (Cyrillic check)
4. Unicode-Norm (combining marks)
5. Whitespace/Frequency (similar)
6. Punctuation
7. Synonym (least unique)
