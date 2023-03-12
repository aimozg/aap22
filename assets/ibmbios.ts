/*
 * Created by aimozg on 11.03.2023.
 */

import {BitmapFont, BitmapFontDef} from "../src/utils/ui/BitmapFont";
import IBMBIOSData from "./ibmbios.png";

let IBMBIOSDef: BitmapFontDef = {
    charWidth: 16,
    charHeight: 16,
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
};

let BitmapFontIBMBIOS = BitmapFont.fromDataURL(IBMBIOSDef, IBMBIOSData);

export default BitmapFontIBMBIOS;
