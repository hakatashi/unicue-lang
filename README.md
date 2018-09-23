# Unicue

スタックベースのユニークなesolang

## 文字

* **ソースコードに同じ文字が含まれてはいけない**
* ソースコードは原則としてUTF-8として解釈される。
* BOMがある場合、BOMに従いUTF-8・UTF-16LE・UTF-16BEとして解釈される。

## 数値

Unicodeのnumericプロパティを持つ文字は即値を引数に持つ命令である。

numericプロパティの数値がそのまま引数になる。

例:

* ⒖ → 15
* ㈦ → 7
* ٨ → 8
* ⅞ → 0.875
* 𞲢 → 20000000

命令の内容はUnicodeのscriptプロパティによって異なり以下のとおりである。

* `Common`: PUSH <数値>
* `Arabic`: ADD <数値>
* `Tamil`: SUB <数値>
* `Devanagari`: MUL <数値>
* `Nko`: DIV <数値>
* `Han`: MOD <数値>
* `Medefaidrin`: ポインタを <数値> 進める

## ループ

UnicodeのGeneral_CategoryがPsもしくはPeの文字はループの始点と終点を構成する。これはUCDのBidi_Paired_Bracketによって定義される対応する括弧にジャンプする条件付き命令である。

**Ps** (開き括弧) は、現在のスタックの一番上の値が0ならば対応する閉じ括弧にジャンプする。(POPしない)

**Pe** (閉じ括弧) は、現在のスタックの一番上野値が0でないならば対応する開き括弧にジャンプする。(POPしない)

## 汎用命令

その他の文字はUnicodeのScriptプロパティの値によって命令が定義される。

* `Modi`: SWAP
* `Egyptian_Hieroglyphs`: POP
* `Linear_A`: READ CHAR
* `Linear_B`: WRITE CHAR
* `Batak`: NEG
* `Runic`: DUP
* `Thai`: DUP3
* `Hiragana`: ADD
* `Katakana`: SUB
* `Telugu`: MUL
* `Geargian`: DIV
* `Myanmar`: CMP
* `Kannada`: GT
* `Devanagari`: LT
* `Cyrillic`: ANG
* `Arabic`: OR
* `Syriac`: NOT