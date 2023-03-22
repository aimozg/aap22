/*
 * Created by aimozg on 11.03.2023.
 */

import {BitmapFont} from "../src/utils/ui/BitmapFont";
import IBMVGA8x16ExData from "./ibmvga8x.png";

/**
 * A 8x16 font rendered into 16x16 cells, centered.
 * Box drawing characters are updated to fill 16x16 cell.
 */
let IBMVGA8x16ExDef = {
    charWidth: 32,
    charHeight: 32,
    gapx: 0,
    gapy: 0,
    chars: [
        ` !"#$%&'()*+,-./0123456789:;<=>?`,
        "@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_",
        "`abcdefghijklmnopqrstuvwxyz{|}~⌂",
        " ¡¢£¤¥¦§¨©ª«¬-®¯°±²³´µ¶·¸¹º»¼½¾¿",
        "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞÞ",
        "ßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþ",
        "ÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞ",
        "ğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľ",
        "ĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞ",
        "şŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽž",
        "ſƒơƷǺǻǼǽǾǿȘșȚțɑɸˆˇˉ˘˙˚˛˜˝;΄΅Ά·ΈΉ",
        "ΊΌΎΏΐΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩΪΫά",
        "έήίΰαβγδεζηθικλμνξοπρςστυφχψωϊϋό",
        "ύώϐϴЀЁЂЃЄЅІЇЈЉЊЋЌЍЎЏАБВГДЕЖЗИЙКЛ",
        "МНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдежзийкл",
        "мнопрстуфхцчшщъыьэюяѐёђѓєѕіїјљњћ",
        "ќѝўџҐґ־אבגדהוזחטיךכלםמןנסעףפץצקר",
        "שתװױײ׳״ᴛᴦᴨẀẁẂẃẄẅẟỲỳ‐‒–—―‗‘’‚‛“”„",
        "‟†‡•…‧‰′″‵‹›‼‾‿⁀⁄⁔⁴⁵⁶⁷⁸⁹⁺⁻ⁿ₁₂₃₄₅",
        "₆₇₈₉₊₋₣₤₧₪€℅ℓ№™Ω℮⅐⅑⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞←",
        "↑→↓↔↕↨∂∅∆∈∏∑−∕∙√∞∟∩∫≈≠≡≤≥⊙⌀⌂⌐⌠⌡─",
        "│┌┐└┘├┤┬┴┼═║╒╓╔╕╖╗╘╙╚╛╜╝╞╟╠╡╢╣╤╥",
        "╦╧╨╩╪╫╬▀▁▄█▌▐░▒▓■□▪▫▬▲►▼◄◊○●◘◙◦☺",
        "☻☼♀♂♠♣♥♦♪♫✓ﬁﬂ�"
    ],
    placeholderChar: '�'
}
let BitmapFontIBMVGA8x16Ex = BitmapFont.fromDataURL(IBMVGA8x16ExDef, IBMVGA8x16ExData);

export default BitmapFontIBMVGA8x16Ex;
