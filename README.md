# Unicue

スタックベースのユニークなesolang

## 文字

* **ソースコードに同じ文字が含まれてはいけない。**
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

UnicodeのGeneral_CategoryがPsもしくはPeの文字はループの始点と終点を構成する。

// TODO: 書く
