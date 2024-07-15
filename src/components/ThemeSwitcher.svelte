<script lang="ts" context="module">
    import { writable } from "svelte/store";
    import type { Writable } from "svelte/store";

    type ThemeProperties = {
        [key: string]: string;
    };

    const themes: { [key: string]: ThemeProperties } = {
        pureWhiteTheme: {
            "--background": "#ffffff",
            "--light-background": "#f8f9fa",
            "--surface": "#e9ecef",
            "--primary-text": "#343a40",
            "--secondary-text": "#6c757d",
            "--dark-text": "#000000",
            "--divider": "#dee2e6",
            "--shadow": "rgba(0, 0, 0, 0.1)",
            "--primary": "#007bff",
            "--secondary": "#6c757d",
            "--warning": "#ffc107",
            "--error": "#dc3545",
            "--info": "#17a2b8",
            "--success": "#28a745",
            "--dropdown-box-shadow": "rgba(0, 123, 255, 0.3)",
            "--group-card-hover": "#f8f9fa",
            "--seperator": "#dee2e6",
            "--select-background-color": "#ffffff",
            "--select-text-color": "#343a40",
            "--select-focus-border-color": "#007bff",
            "--select-focus-box-shadow": "rgba(0, 123, 255, 0.3)",
        },
        whiteTheme: {
            "--background": "#ffffff",
            "--light-background": "#f7f7f7",
            "--surface": "#e0e0e0",
            "--primary-text": "#212121",
            "--secondary-text": "#757575",
            "--dark-text": "#000000",
            "--divider": "#bdbdbd",
            "--shadow": "rgba(0, 0, 0, 0.1)",
            "--primary": "#3f51b5",
            "--secondary": "#ff4081",
            "--warning": "#ffc107",
            "--error": "#f44336",
            "--info": "#2196f3",
            "--success": "#4caf50",
            "--dropdown-box-shadow": "rgba(63, 81, 181, 0.3)",
            "--group-card-hover": "#f7f7f7",
            "--seperator": "#e0e0e0",
            "--select-background-color": "#ffffff",
            "--select-text-color": "#212121",
            "--select-focus-border-color": "#3f51b5",
            "--select-focus-box-shadow": "rgba(63, 81, 181, 0.3)",
        },
        arcticBreezeTheme: {
            "--background": "#ffffff", // Beyaz arka plan
            "--light-background": "#f0f8ff", // Açık buz mavisi yüzey
            "--surface": "#e3f2fd", // Açık buz mavisi yüzey
            "--primary-text": "#212121", // Koyu gri metin
            "--secondary-text": "#616161", // Orta gri metin
            "--dark-text": "#000000", // Siyah metin
            "--divider": "#b3e5fc", // Açık buz mavisi bölücü
            "--shadow": "rgba(0, 0, 0, 0.1)", // Açık gri gölge
            "--primary": "#4fc3f7", // Açık mavi
            "--secondary": "#29b6f6", // Orta mavi
            "--warning": "#ffb74d", // Açık turuncu
            "--error": "#ef5350", // Açık kırmızı
            "--info": "#64b5f6", // Açık mavi
            "--success": "#81c784", // Açık yeşil
            "--dropdown-box-shadow": "rgba(79, 195, 247, 0.5)", // Şeffaf açık mavi
            "--group-card-hover": "#f0f8ff", // Açık buz mavisi
            "--seperator": "#b3e5fc", // Açık buz mavisi
            "--select-background-color": "#e3f2fd", // Açık buz mavisi
            "--select-text-color": "#212121", // Koyu gri
            "--select-focus-border-color": "#4fc3f7", // Açık mavi
            "--select-focus-box-shadow": "rgba(79, 195, 247, 0.3)", // Şeffaf açık mavi
        },
        cloudNineTheme: {
            "--background": "#ffffff", // Beyaz arka plan
            "--light-background": "#f5f5f5", // Çok açık gri yüzey
            "--surface": "#e0e0e0", // Açık gri yüzey
            "--primary-text": "#212121", // Koyu gri metin
            "--secondary-text": "#757575", // Orta gri metin
            "--dark-text": "#000000", // Siyah metin
            "--divider": "#bdbdbd", // Açık gri bölücü
            "--shadow": "rgba(0, 0, 0, 0.1)", // Açık gri gölge
            "--primary": "#90caf9", // Açık mavi
            "--secondary": "#64b5f6", // Orta mavi
            "--warning": "#ffb74d", // Açık turuncu
            "--error": "#f44336", // Kırmızı
            "--info": "#29b6f6", // Parlak mavi
            "--success": "#81c784", // Açık yeşil
            "--dropdown-box-shadow": "rgba(144, 202, 249, 0.5)", // Şeffaf açık mavi
            "--group-card-hover": "#f0f0f0", // Çok açık gri
            "--seperator": "#bdbdbd", // Açık gri
            "--select-background-color": "#e0e0e0", // Açık gri
            "--select-text-color": "#212121", // Koyu gri
            "--select-focus-border-color": "#90caf9", // Açık mavi
            "--select-focus-box-shadow": "rgba(144, 202, 249, 0.3)", // Şeffaf açık mavi
        },
        ghostlyWhisperTheme: {
            "--background": "#f8f8f8", // Çok açık gri arka plan
            "--light-background": "#ffffff", // Beyaz yüzey
            "--surface": "#f5f5f5", // Çok açık gri yüzey
            "--primary-text": "#424242", // Koyu gri metin
            "--secondary-text": "#757575", // Orta gri metin
            "--dark-text": "#000000", // Siyah metin
            "--divider": "#e0e0e0", // Açık gri bölücü
            "--shadow": "rgba(0, 0, 0, 0.1)", // Açık gri gölge
            "--primary": "#9e9e9e", // Orta gri
            "--secondary": "#bdbdbd", // Açık gri
            "--warning": "#ffc107", // Sarı
            "--error": "#e53935", // Kırmızı
            "--info": "#64b5f6", // Açık mavi
            "--success": "#4caf50", // Yeşil
            "--dropdown-box-shadow": "rgba(158, 158, 158, 0.5)", // Şeffaf orta gri
            "--group-card-hover": "#ffffff", // Beyaz
            "--seperator": "#e0e0e0", // Açık gri
            "--select-background-color": "#f5f5f5", // Çok açık gri
            "--select-text-color": "#424242", // Koyu gri
            "--select-focus-border-color": "#9e9e9e", // Orta gri
            "--select-focus-box-shadow": "rgba(158, 158, 158, 0.3)", // Şeffaf orta gri
        },
        mistyMorningTheme: {
            "--background": "#e0e0e0" /* Light gray background */,
            "--light-background": "#f5f5f5" /* Very light gray surface */,
            "--surface": "#ffffff" /* White surface */,
            "--primary-text": "#424242" /* Dark gray primary text */,
            "--secondary-text": "#9e9e9e" /* Medium gray secondary text */,
            "--dark-text": "#000000" /* Black text */,
            "--divider": "#bdbdbd" /* Medium light gray divider */,
            "--shadow": "rgba(224, 224, 224, 0.7)" /* Light gray shadow */,
            "--primary": "#b0bec5" /* Light gray-blue primary color */,
            "--secondary": "#cfd8dc" /* Very light gray-blue secondary color */,
            "--tertiary": "#eceff1" /* Light gray tertiary color */,
            "--quaternary": "#fafafa" /* Very light gray quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(176, 190, 197, 0.7)" /* Light gray-blue shadow */,
            "--group-card-hover":
                "#f5f5f5" /* Very light gray card hover color */,
            "--separator": "#bdbdbd" /* Medium light gray separator */,
            "--select-background-color":
                "#ffffff" /* White select background color */,
            "--select-text-color": "#424242" /* Dark gray select text color */,
            "--select-focus-border-color":
                "#b0bec5" /* Light gray-blue focus border color */,
            "--select-focus-box-shadow":
                "rgba(176, 190, 197, 0.3)" /* Light gray-blue focus shadow */,
        },
        foggyMountainTheme: {
            "--background": "#cfd8dc" /* Very light gray-blue background */,
            "--light-background": "#eceff1" /* Very light gray surface */,
            "--surface": "#ffffff" /* White surface */,
            "--primary-text": "#37474f" /* Dark gray-blue primary text */,
            "--secondary-text": "#607d8b" /* Medium gray-blue secondary text */,
            "--dark-text": "#000000" /* Black text */,
            "--divider": "#90a4ae" /* Light gray-blue divider */,
            "--shadow":
                "rgba(207, 216, 220, 0.7)" /* Very light gray-blue shadow */,
            "--primary": "#78909c" /* Medium gray-blue primary color */,
            "--secondary": "#90a4ae" /* Light gray-blue secondary color */,
            "--tertiary": "#b0bec5" /* Light gray-blue tertiary color */,
            "--quaternary":
                "#cfd8dc" /* Very light gray-blue quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(120, 144, 156, 0.7)" /* Medium gray-blue shadow */,
            "--group-card-hover":
                "#eceff1" /* Very light gray card hover color */,
            "--separator": "#90a4ae" /* Light gray-blue separator */,
            "--select-background-color":
                "#ffffff" /* White select background color */,
            "--select-text-color":
                "#37474f" /* Dark gray-blue select text color */,
            "--select-focus-border-color":
                "#78909c" /* Medium gray-blue focus border color */,
            "--select-focus-box-shadow":
                "rgba(120, 144, 156, 0.3)" /* Medium gray-blue focus shadow */,
        },
        macosTheme: {
            "--background": "#f8f8f8" /* Light gray background */,
            "--light-background": "#ffffff" /* White surface */,
            "--surface": "#e0e0e0" /* Light gray surface */,
            "--primary-text": "#333333" /* Dark gray primary text */,
            "--secondary-text": "#777777" /* Medium gray secondary text */,
            "--dark-text": "#000000" /* Black text */,
            "--divider": "#d0d0d0" /* Medium light gray divider */,
            "--shadow": "rgba(0, 0, 0, 0.15)" /* Light shadow */,
            "--primary": "#007aff" /* Bright blue primary color */,
            "--secondary": "#5856d6" /* Purple secondary color */,
            "--tertiary": "#ff9500" /* Orange tertiary color */,
            "--quaternary": "#ff3b30" /* Red quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#ff3b30" /* Red error color */,
            "--info": "#5ac8fa" /* Cyan info color */,
            "--success": "#4cd964" /* Green success color */,
            "--dropdown-box-shadow":
                "rgba(0, 122, 255, 0.7)" /* Bright blue shadow */,
            "--group-card-hover": "#e0e0e0" /* Light gray card hover color */,
            "--separator": "#d0d0d0" /* Medium light gray separator */,
            "--select-background-color":
                "#ffffff" /* White select background color */,
            "--select-text-color": "#333333" /* Dark gray select text color */,
            "--select-focus-border-color":
                "#007aff" /* Bright blue focus border color */,
            "--select-focus-box-shadow":
                "rgba(0, 122, 255, 0.3)" /* Bright blue focus shadow */,
        },
        silverLiningTheme: {
            "--background": "#f0f0f0", // Açık gümüş gri arka plan
            "--light-background": "#ffffff", // Beyaz yüzey
            "--surface": "#d3d3d3", // Gümüş gri yüzey
            "--primary-text": "#2e2e2e", // Koyu gri metin
            "--secondary-text": "#a9a9a9", // Orta gri metin
            "--dark-text": "#000000", // Siyah metin
            "--divider": "#b0b0b0", // Açık gri bölücü
            "--shadow": "rgba(211, 211, 211, 0.5)", // Şeffaf gümüş gri gölge
            "--primary": "#9e9e9e", // Orta gri
            "--secondary": "#bdbdbd", // Açık gri
            "--warning": "#ffc107", // Sarı
            "--error": "#e53935", // Kırmızı
            "--info": "#64b5f6", // Açık mavi
            "--success": "#4caf50", // Yeşil
            "--dropdown-box-shadow": "rgba(158, 158, 158, 0.5)", // Şeffaf orta gri
            "--group-card-hover": "#ffffff", // Beyaz
            "--seperator": "#b0b0b0", // Açık gri
            "--select-background-color": "#d3d3d3", // Gümüş gri
            "--select-text-color": "#2e2e2e", // Koyu gri
            "--select-focus-border-color": "#9e9e9e", // Orta gri
            "--select-focus-box-shadow": "rgba(158, 158, 158, 0.3)", // Şeffaf orta gri
        },
        lightGrayTheme: {
            "--background": "#fafafa",
            "--light-background": "#ffffff",
            "--surface": "#f0f0f0",
            "--primary-text": "#424242",
            "--secondary-text": "#9e9e9e",
            "--dark-text": "#000000",
            "--divider": "#e0e0e0",
            "--shadow": "rgba(0, 0, 0, 0.1)",
            "--primary": "#1976d2",
            "--secondary": "#c2185b",
            "--warning": "#ff9800",
            "--error": "#d32f2f",
            "--info": "#0288d1",
            "--success": "#388e3c",
            "--dropdown-box-shadow": "rgba(25, 118, 210, 0.3)",
            "--group-card-hover": "#f0f0f0",
            "--seperator": "#e0e0e0",
            "--select-background-color": "#ffffff",
            "--select-text-color": "#424242",
            "--select-focus-border-color": "#1976d2",
            "--select-focus-box-shadow": "rgba(25, 118, 210, 0.3)",
        },
        windows11Theme: {
            "--background": "#f3f3f3" /* Light gray background */,
            "--light-background": "#ffffff" /* White surface */,
            "--surface": "#e5e5e5" /* Very light gray surface */,
            "--primary-text": "#1a1a1a" /* Dark gray primary text */,
            "--secondary-text": "#757575" /* Medium gray secondary text */,
            "--dark-text": "#000000" /* Black text */,
            "--divider": "#cccccc" /* Light gray divider */,
            "--shadow": "rgba(0, 0, 0, 0.1)" /* Very light shadow */,
            "--primary": "#0078d4" /* Bright blue primary color */,
            "--secondary": "#005a9e" /* Medium blue secondary color */,
            "--tertiary": "#003a78" /* Dark blue tertiary color */,
            "--quaternary": "#ffffff" /* White quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#d13438" /* Red error color */,
            "--info": "#5ac8fa" /* Cyan info color */,
            "--success": "#107c10" /* Green success color */,
            "--dropdown-box-shadow":
                "rgba(0, 120, 212, 0.7)" /* Bright blue shadow */,
            "--group-card-hover":
                "#e5e5e5" /* Very light gray card hover color */,
            "--separator": "#cccccc" /* Light gray separator */,
            "--select-background-color":
                "#ffffff" /* White select background color */,
            "--select-text-color": "#1a1a1a" /* Dark gray select text color */,
            "--select-focus-border-color":
                "#0078d4" /* Bright blue focus border color */,
            "--select-focus-box-shadow":
                "rgba(0, 120, 212, 0.3)" /* Bright blue focus shadow */,
        },
        creamTheme: {
            "--background": "#f0f0e9",
            "--light-background": "#ffffff",
            "--surface": "#d9d9d1",
            "--primary-text": "#4e4e4e",
            "--secondary-text": "#7d7d7d",
            "--dark-text": "#1c1c1c",
            "--divider": "#bfbfbf",
            "--shadow": "rgba(76, 76, 76, 0.25)",
            "--primary": "#8c7b75",
            "--secondary": "#b29e96",
            "--warning": "#f4a261",
            "--error": "#e76f51",
            "--info": "#6d9eeb",
            "--success": "#9acd32",
            "--dropdown-box-shadow": "rgba(140, 123, 117, 0.7)",
            "--group-card-hover": "#ece5e0",
            "--seperator": "#ccc5be",
            "--select-background-color": "#ebe7e2",
            "--select-text-color": "#4e4e4e",
            "--select-focus-border-color": "#8c7b75",
            "--select-focus-box-shadow": "rgba(140, 123, 117, 0.3)",
        },
        vanillaCreamTheme: {
            "--background": "#fff9c4", // Açık krem arka plan
            "--light-background": "#ffffff", // Beyaz yüzey
            "--surface": "#fff59d", // Açık krem yüzey
            "--primary-text": "#333333", // Koyu gri metin
            "--secondary-text": "#666666", // Orta gri metin
            "--dark-text": "#000000", // Siyah metin
            "--divider": "#ffe082", // Açık sarı bölücü
            "--shadow": "rgba(255, 249, 196, 0.5)", // Şeffaf açık krem gölge
            "--primary": "#fbc02d", // Açık sarı
            "--secondary": "#ffa726", // Orta turuncu
            "--warning": "#ffb74d", // Açık turuncu
            "--error": "#ef5350", // Açık kırmızı
            "--info": "#64b5f6", // Açık mavi
            "--success": "#c8e6c9", // Açık yeşil
            "--dropdown-box-shadow": "rgba(251, 192, 45, 0.5)", // Şeffaf açık sarı
            "--group-card-hover": "#ffffff", // Beyaz
            "--seperator": "#ffe082", // Açık sarı
            "--select-background-color": "#fff59d", // Açık krem
            "--select-text-color": "#333333", // Koyu gri
            "--select-focus-border-color": "#fbc02d", // Açık sarı
            "--select-focus-box-shadow": "rgba(251, 192, 45, 0.3)", // Şeffaf açık sarı
        },
        neutralTheme: {
            "--background": "#f5f5f5",
            "--light-background": "#ffffff",
            "--surface": "#e0e0e0",
            "--primary-text": "#212121",
            "--secondary-text": "#757575",
            "--dark-text": "#000000",
            "--divider": "#bdbdbd",
            "--shadow": "rgba(33, 33, 33, 0.25)",
            "--primary": "#3f51b5",
            "--secondary": "#ff4081",
            "--warning": "#ffa000",
            "--error": "#d32f2f",
            "--info": "#1976d2",
            "--success": "#388e3c",
            "--dropdown-box-shadow": "rgba(63, 81, 181, 0.7)",
            "--group-card-hover": "#e8eaf6",
            "--seperator": "#c5cae9",
            "--select-background-color": "#f5f5f5",
            "--select-text-color": "#212121",
            "--select-focus-border-color": "#3f51b5",
            "--select-focus-box-shadow": "rgba(63, 81, 181, 0.3)",
        },
        paleYellowTheme: {
            "--background": "#fffde7",
            "--light-background": "#fffff8",
            "--surface": "#fff9c4",
            "--primary-text": "#212121",
            "--secondary-text": "#757575",
            "--dark-text": "#000000",
            "--divider": "#e0e0e0",
            "--shadow": "rgba(0, 0, 0, 0.1)",
            "--primary": "#fbc02d",
            "--secondary": "#ffa000",
            "--warning": "#ffeb3b",
            "--error": "#f44336",
            "--info": "#29b6f6",
            "--success": "#66bb6a",
            "--dropdown-box-shadow": "rgba(251, 192, 45, 0.3)",
            "--group-card-hover": "#fffff8",
            "--seperator": "#e0e0e0",
            "--select-background-color": "#fffde7",
            "--select-text-color": "#212121",
            "--select-focus-border-color": "#fbc02d",
            "--select-focus-box-shadow": "rgba(251, 192, 45, 0.3)",
        },
        sereneDawnTheme: {
            "--background": "#f7f7f7", // Açık gri arka plan
            "--light-background": "#ffffff", // Beyaz yüzey
            "--surface": "#f0f0f0", // Açık gri yüzey
            "--primary-text": "#333333", // Koyu gri metin
            "--secondary-text": "#666666", // Orta gri metin
            "--dark-text": "#000000", // Siyah metin
            "--divider": "#e0e0e0", // Açık gri bölücü
            "--shadow": "rgba(0, 0, 0, 0.1)", // Açık gri gölge
            "--primary": "#a7d4cb", // Pastel yeşil
            "--secondary": "#e1bee7", // Pastel mor
            "--warning": "#ffcc80", // Pastel turuncu
            "--error": "#f48fb1", // Pastel pembe
            "--info": "#81d4fa", // Pastel mavi
            "--success": "#c5e1a5", // Pastel yeşil
            "--dropdown-box-shadow": "rgba(167, 212, 203, 0.5)", // Şeffaf pastel yeşil
            "--group-card-hover": "#ffffff", // Beyaz
            "--seperator": "#e0e0e0", // Açık gri
            "--select-background-color": "#f0f0f0", // Açık gri
            "--select-text-color": "#333333", // Koyu gri
            "--select-focus-border-color": "#a7d4cb", // Pastel yeşil
            "--select-focus-box-shadow": "rgba(167, 212, 203, 0.3)", // Şeffaf pastel yeşil
        },
        arcticBloomTheme: {
            "--background": "#e0f7fa", // Açık buzul mavisi arka plan
            "--light-background": "#ffffff", // Beyaz yüzey
            "--surface": "#b2ebf2", // Açık buzul mavisi yüzey
            "--primary-text": "#263238", // Koyu gri-mavi metin
            "--secondary-text": "#546e7a", // Orta gri-mavi metin
            "--dark-text": "#000000", // Siyah metin
            "--divider": "#90caf9", // Açık buzul mavisi bölücü
            "--shadow": "rgba(176, 247, 250, 0.5)", // Şeffaf buzul mavisi gölge
            "--primary": "#f48fb1", // Parlak pembe
            "--secondary": "#64b5f6", // Açık mavi
            "--warning": "#ffcc80", // Açık turuncu
            "--error": "#ef5350", // Açık kırmızı
            "--info": "#29b6f6", // Parlak mavi
            "--success": "#81c784", // Açık yeşil
            "--dropdown-box-shadow": "rgba(244, 143, 177, 0.5)", // Şeffaf parlak pembe
            "--group-card-hover": "#ffffff", // Beyaz
            "--seperator": "#90caf9", // Açık buzul mavisi
            "--select-background-color": "#b2ebf2", // Açık buzul mavisi
            "--select-text-color": "#263238", // Koyu gri-mavi
            "--select-focus-border-color": "#f48fb1", // Parlak pembe
            "--select-focus-box-shadow": "rgba(244, 143, 177, 0.3)", // Şeffaf parlak pembe
        },
        zenGardenTheme: {
            "--background": "#f2f2f2", // Açık gri arka plan
            "--light-background": "#ffffff", // Beyaz yüzey
            "--surface": "#e0e0e0", // Açık gri yüzey
            "--primary-text": "#333333", // Koyu gri metin
            "--secondary-text": "#666666", // Orta gri metin
            "--dark-text": "#000000", // Siyah metin
            "--divider": "#d9d9d9", // Açık gri bölücü
            "--shadow": "rgba(0, 0, 0, 0.1)", // Açık gri gölge
            "--primary": "#7cb342", // Orta yeşil
            "--secondary": "#a1887f", // Açık kahverengi
            "--warning": "#ffb74d", // Açık turuncu
            "--error": "#ef5350", // Açık kırmızı
            "--info": "#64b5f6", // Açık mavi
            "--success": "#81c784", // Açık yeşil
            "--dropdown-box-shadow": "rgba(124, 179, 66, 0.5)", // Şeffaf orta yeşil
            "--group-card-hover": "#ffffff", // Beyaz
            "--seperator": "#d9d9d9", // Açık gri
            "--select-background-color": "#e0e0e0", // Açık gri
            "--select-text-color": "#333333", // Koyu gri
            "--select-focus-border-color": "#7cb342", // Orta yeşil
            "--select-focus-box-shadow": "rgba(124, 179, 66, 0.3)", // Şeffaf orta yeşil
        },
        solarPunkTheme: {
            "--background": "#f0f4c3", // Açık yeşil-sarı arka plan
            "--light-background": "#ffffff", // Beyaz yüzey
            "--surface": "#dcedc8", // Açık yeşil yüzey
            "--primary-text": "#333333", // Koyu gri metin
            "--secondary-text": "#666666", // Orta gri metin
            "--dark-text": "#000000", // Siyah metin
            "--divider": "#c5e1a5", // Açık yeşil bölücü
            "--shadow": "rgba(220, 237, 200, 0.5)", // Şeffaf açık yeşil gölge
            "--primary": "#aed581", // Orta yeşil
            "--secondary": "#ffb74d", // Açık turuncu
            "--warning": "#ffcc80", // Açık turuncu
            "--error": "#ef5350", // Açık kırmızı
            "--info": "#64b5f6", // Açık mavi
            "--success": "#81c784", // Açık yeşil
            "--dropdown-box-shadow": "rgba(174, 213, 129, 0.5)", // Şeffaf orta yeşil
            "--group-card-hover": "#ffffff", // Beyaz
            "--seperator": "#c5e1a5", // Açık yeşil
            "--select-background-color": "#dcedc8", // Açık yeşil
            "--select-text-color": "#333333", // Koyu gri
            "--select-focus-border-color": "#aed581", // Orta yeşil
            "--select-focus-box-shadow": "rgba(174, 213, 129, 0.3)", // Şeffaf orta yeşil
        },
        vintageRoseTheme: {
            "--background": "#ffe0b2", // Açık krem arka plan
            "--light-background": "#ffffff", // Beyaz yüzey
            "--surface": "#ffebee", // Soluk pembe yüzey
            "--primary-text": "#424242", // Koyu gri metin
            "--secondary-text": "#757575", // Orta gri metin
            "--dark-text": "#000000", // Siyah metin
            "--divider": "#f8bbd0", // Soluk pembe bölücü
            "--shadow": "rgba(255, 224, 178, 0.5)", // Şeffaf açık krem gölge
            "--primary": "#e91e63", // Parlak pembe
            "--secondary": "#f06292", // Açık pembe
            "--warning": "#ffb74d", // Açık turuncu
            "--error": "#ef5350", // Açık kırmızı
            "--info": "#64b5f6", // Açık mavi
            "--success": "#c8e6c9", // Açık yeşil
            "--dropdown-box-shadow": "rgba(233, 30, 99, 0.5)", // Şeffaf parlak pembe
            "--group-card-hover": "#ffffff", // Beyaz
            "--seperator": "#f8bbd0", // Soluk pembe
            "--select-background-color": "#ffebee", // Soluk pembe
            "--select-text-color": "#424242", // Koyu gri
            "--select-focus-border-color": "#e91e63", // Parlak pembe
            "--select-focus-box-shadow": "rgba(233, 30, 99, 0.3)", // Şeffaf parlak pembe
        },
        candyCrushTheme: {
            "--background": "#f9f0f0", // Açık pembe arka plan
            "--light-background": "#ffffff", // Beyaz yüzey
            "--surface": "#f4e0e0", // Açık pembe yüzey
            "--primary-text": "#333333", // Koyu gri metin
            "--secondary-text": "#666666", // Orta gri metin
            "--dark-text": "#000000", // Siyah metin
            "--divider": "#e9c4e0", // Açık pembe bölücü
            "--shadow": "rgba(0, 0, 0, 0.1)", // Açık gri gölge
            "--primary": "#f48fb1", // Parlak pembe
            "--secondary": "#81d4fa", // Açık mavi
            "--warning": "#ffd54f", // Açık sarı
            "--error": "#e57373", // Açık kırmızı
            "--info": "#64b5f6", // Açık mavi
            "--success": "#81c784", // Açık yeşil
            "--dropdown-box-shadow": "rgba(244, 143, 177, 0.5)", // Şeffaf parlak pembe
            "--group-card-hover": "#ffffff", // Beyaz
            "--seperator": "#e9c4e0", // Açık pembe
            "--select-background-color": "#f4e0e0", // Açık pembe
            "--select-text-color": "#333333", // Koyu gri
            "--select-focus-border-color": "#f48fb1", // Parlak pembe
            "--select-focus-box-shadow": "rgba(244, 143, 177, 0.3)", // Şeffaf parlak pembe
        },
        amberYellowTheme: {
            "--background": "#ffca28" /* Amber yellow background */,
            "--light-background": "#ffecb3" /* Light amber yellow surface */,
            "--surface": "#ffca28" /* Amber yellow surface */,
            "--primary-text": "#3e2723" /* Dark brown primary text */,
            "--secondary-text": "#795548" /* Medium brown secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#ffe082" /* Light yellow divider */,
            "--shadow": "rgba(255, 202, 40, 0.5)" /* Amber yellow shadow */,
            "--primary": "#ffca28" /* Amber yellow primary color */,
            "--secondary": "#ffe082" /* Light yellow secondary color */,
            "--warning": "#ffa726" /* Bright orange warning color */,
            "--error": "#d32f2f" /* Bright red error color */,
            "--info": "#29b6f6" /* Bright blue info color */,
            "--success": "#66bb6a" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(255, 202, 40, 0.7)" /* Amber yellow shadow */,
            "--group-card-hover":
                "#ffecb3" /* Light amber yellow card hover color */,
            "--separator": "#ffe082" /* Light yellow separator */,
            "--select-background-color":
                "#ffca28" /* Amber yellow select background color */,
            "--select-text-color": "#3e2723" /* Dark brown select text color */,
            "--select-focus-border-color":
                "#ffca28" /* Amber yellow focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 202, 40, 0.3)" /* Amber yellow focus shadow */,
        },
        ubuntuTheme: {
            "--background": "#2e3436" /* Dark gray background */,
            "--light-background": "#ffffff" /* White surface */,
            "--surface": "#e0e0e0" /* Light gray surface */,
            "--primary-text": "#333333" /* Dark gray primary text */,
            "--secondary-text": "#777777" /* Medium gray secondary text */,
            "--dark-text": "#000000" /* Black text */,
            "--divider": "#d0d0d0" /* Medium light gray divider */,
            "--shadow": "rgba(0, 0, 0, 0.15)" /* Light shadow */,
            "--primary": "#e95420" /* Bright orange primary color */,
            "--secondary": "#77216f" /* Purple secondary color */,
            "--tertiary": "#5e2750" /* Dark purple tertiary color */,
            "--quaternary": "#ffffff" /* White quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#ff3b30" /* Red error color */,
            "--info": "#5ac8fa" /* Cyan info color */,
            "--success": "#4cd964" /* Green success color */,
            "--dropdown-box-shadow":
                "rgba(233, 84, 32, 0.7)" /* Bright orange shadow */,
            "--group-card-hover": "#e0e0e0" /* Light gray card hover color */,
            "--separator": "#d0d0d0" /* Medium light gray separator */,
            "--select-background-color":
                "#ffffff" /* White select background color */,
            "--select-text-color": "#333333" /* Dark gray select text color */,
            "--select-focus-border-color":
                "#e95420" /* Bright orange focus border color */,
            "--select-focus-box-shadow":
                "rgba(233, 84, 32, 0.3)" /* Bright orange focus shadow */,
        },
        default: {
            "--background": "#f5f5f5",
            "--light-background": "#ffffff",
            "--surface": "#eeeeee",
            "--primary-text": "#31363f",
            "--secondary-text": "#dde6ed",
            "--dark-text": "#111111",
            "--divider": "#dde6ed",
            "--shadow": "rgba(0, 0, 0, 0.25)",
            "--primary": "#526d82",
            "--secondary": "#9db2bf",
            "--warning": "#ffd966",
            "--error": "#f28b82",
            "--info": "#7ea8d7",
            "--success": "#90c695",
            "--dropdown-box-shadow": "rgba(162, 206, 209, 0.7)",
            "--group-card-hover": "#f0f0f0",
            "--seperator": "#cccccc",
            "--select-background-color": "#f3f4f6",
            "--select-text-color": "#374151",
            "--select-focus-border-color": "#2563eb",
            "--select-focus-box-shadow": "rgba(37, 99, 235, 0.3)",
        },

        gunmetalSymphonyTheme: {
            "--background": "#262626", // Gunmetal gri arka plan
            "--light-background": "#333333", // Koyu gri yüzey
            "--surface": "#404040", // Antrasit gri yüzey
            "--primary-text": "#d9d9d9", // Açık gri metin
            "--secondary-text": "#a9a9a9", // Orta gri metin
            "--dark-text": "#ffffff", // Beyaz metin
            "--divider": "#595959", // Koyu gri bölücü
            "--shadow": "rgba(38, 38, 38, 0.7)", // Şeffaf gunmetal gri gölge
            "--primary": "#616161", // Koyu gri
            "--secondary": "#787878", // Orta koyu gri
            "--warning": "#e5c07b", // Sarımsı turuncu
            "--error": "#e06c75", // Kırmızımsı pembe
            "--info": "#56b6c2", // Açık mavi-yeşil
            "--success": "#98c379", // Yeşilimsi sarı
            "--dropdown-box-shadow": "rgba(97, 97, 97, 0.5)", // Şeffaf koyu gri
            "--group-card-hover": "#333333", // Koyu gri
            "--seperator": "#595959", // Koyu gri
            "--select-background-color": "#404040", // Antrasit gri
            "--select-text-color": "#d9d9d9", // Açık gri
            "--select-focus-border-color": "#616161", // Koyu gri
            "--select-focus-box-shadow": "rgba(97, 97, 97, 0.3)", // Şeffaf koyu gri
        },

        desertSunsetTheme: {
            "--background": "#e67e22", // Turuncu arka plan
            "--light-background": "#f48fb1", // Açık pembe yüzey
            "--surface": "#ff9800", // Turuncu yüzey
            "--primary-text": "#ffffff", // Beyaz metin
            "--secondary-text": "#e8d9c9", // Açık bej metin
            "--dark-text": "#3e2723", // Koyu kahverengi metin
            "--divider": "#ffa726", // Açık turuncu bölücü
            "--shadow": "rgba(230, 126, 34, 0.7)", // Şeffaf turuncu gölge
            "--primary": "#9c27b0", // Mor
            "--secondary": "#f06292", // Açık pembe
            "--warning": "#ffcc80", // Açık turuncu
            "--error": "#d32f2f", // Kırmızı
            "--info": "#4fc3f7", // Açık mavi
            "--success": "#c8e6c9", // Açık yeşil
            "--dropdown-box-shadow": "rgba(156, 39, 176, 0.5)", // Şeffaf mor
            "--group-card-hover": "#f48fb1", // Açık pembe
            "--seperator": "#ffa726", // Açık turuncu
            "--select-background-color": "#ff9800", // Turuncu
            "--select-text-color": "#ffffff", // Beyaz
            "--select-focus-border-color": "#9c27b0", // Mor
            "--select-focus-box-shadow": "rgba(156, 39, 176, 0.3)", // Şeffaf mor
        },
        enchantedForestTheme: {
            "--background": "#1b261b", // Koyu yeşil arka plan
            "--light-background": "#273327", // Orta koyu yeşil yüzey
            "--surface": "#334033", // Koyu yeşil yüzey
            "--primary-text": "#d0e0d0", // Açık yeşil-gri metin
            "--secondary-text": "#a0b0a0", // Orta yeşil-gri metin
            "--dark-text": "#ffffff", // Beyaz metin
            "--divider": "#404d40", // Koyu yeşil bölücü
            "--shadow": "rgba(27, 38, 27, 0.7)", // Şeffaf koyu yeşil gölge
            "--primary": "#673ab7", // Mor
            "--secondary": "#ffd700", // Altın sarısı
            "--warning": "#ffeb3b", // Açık sarı
            "--error": "#e06c75", // Kırmızımsı pembe
            "--info": "#56b6c2", // Açık mavi-yeşil
            "--success": "#98c379", // Yeşilimsi sarı
            "--dropdown-box-shadow": "rgba(103, 58, 183, 0.5)", // Şeffaf mor
            "--group-card-hover": "#273327", // Orta koyu yeşil
            "--seperator": "#404d40", // Koyu yeşil
            "--select-background-color": "#334033", // Koyu yeşil
            "--select-text-color": "#d0e0d0", // Açık yeşil-gri
            "--select-focus-border-color": "#673ab7", // Mor
            "--select-focus-box-shadow": "rgba(103, 58, 183, 0.3)", // Şeffaf mor
        },
        cyberDawnTheme: {
            "--background": "#221827", // Koyu mor arka plan
            "--light-background": "#322339", // Orta koyu mor yüzey
            "--surface": "#422e4b", // Mor yüzey
            "--primary-text": "#e8d9c9", // Açık bej metin
            "--secondary-text": "#c5b2a3", // Orta bej metin
            "--dark-text": "#ffffff", // Beyaz metin
            "--divider": "#593c5f", // Koyu mor bölücü
            "--shadow": "rgba(34, 24, 39, 0.7)", // Şeffaf koyu mor gölge
            "--primary": "#ff7043", // Turuncu
            "--secondary": "#f48fb1", // Pembe
            "--warning": "#ffcc80", // Açık turuncu
            "--error": "#e57373", // Açık kırmızı
            "--info": "#64b5f6", // Açık mavi
            "--success": "#aed581", // Açık yeşil
            "--dropdown-box-shadow": "rgba(255, 112, 67, 0.5)", // Şeffaf turuncu
            "--group-card-hover": "#322339", // Orta koyu mor
            "--seperator": "#593c5f", // Koyu mor
            "--select-background-color": "#422e4b", // Mor
            "--select-text-color": "#e8d9c9", // Açık bej
            "--select-focus-border-color": "#ff7043", // Turuncu
            "--select-focus-box-shadow": "rgba(255, 112, 67, 0.3)", // Şeffaf turuncu
        },
        arcticNightTheme: {
            "--background": "#1e274a", // Koyu mavi arka plan
            "--light-background": "#283568", // Orta koyu mavi yüzey
            "--surface": "#32438a", // Koyu mavi yüzey
            "--primary-text": "#d4e6f1", // Açık mavi metin
            "--secondary-text": "#aed6f1", // Orta mavi metin
            "--dark-text": "#ffffff", // Beyaz metin
            "--divider": "#42549d", // Koyu mavi bölücü
            "--shadow": "rgba(30, 39, 74, 0.7)", // Şeffaf koyu mavi gölge
            "--primary": "#64b5f6", // Açık mavi
            "--secondary": "#4fc3f7", // Açık mavi-yeşil
            "--warning": "#e5c07b", // Sarımsı turuncu
            "--error": "#e06c75", // Kırmızımsı pembe
            "--info": "#29b6f6", // Parlak mavi
            "--success": "#66bb6a", // Açık yeşil
            "--dropdown-box-shadow": "rgba(100, 181, 246, 0.5)", // Şeffaf açık mavi
            "--group-card-hover": "#283568", // Orta koyu mavi
            "--seperator": "#42549d", // Koyu mavi
            "--select-background-color": "#32438a", // Koyu mavi
            "--select-text-color": "#d4e6f1", // Açık mavi
            "--select-focus-border-color": "#64b5f6", // Açık mavi
            "--select-focus-box-shadow": "rgba(100, 181, 246, 0.3)", // Şeffaf açık mavi
        },
        duskSerenityTheme: {
            "--background": "#f2e7dc", // Açık bej arka plan
            "--light-background": "#ffffff", // Beyaz yüzey
            "--surface": "#e8d9c9", // Açık bej yüzey
            "--primary-text": "#333333", // Koyu gri metin
            "--secondary-text": "#666666", // Orta gri metin
            "--dark-text": "#000000", // Siyah metin
            "--divider": "#d7ccc8", // Açık bej bölücü
            "--shadow": "rgba(0, 0, 0, 0.1)", // Açık gri gölge
            "--primary": "#b39ddb", // Açık mor
            "--secondary": "#ffb74d", // Açık turuncu
            "--warning": "#ffcc80", // Açık turuncu
            "--error": "#ef5350", // Açık kırmızı
            "--info": "#64b5f6", // Açık mavi
            "--success": "#81c784", // Açık yeşil
            "--dropdown-box-shadow": "rgba(179, 157, 219, 0.5)", // Şeffaf açık mor
            "--group-card-hover": "#ffffff", // Beyaz
            "--seperator": "#d7ccc8", // Açık bej
            "--select-background-color": "#e8d9c9", // Açık bej
            "--select-text-color": "#333333", // Koyu gri
            "--select-focus-border-color": "#b39ddb", // Açık mor
            "--select-focus-box-shadow": "rgba(179, 157, 219, 0.3)", // Şeffaf açık mor
        },
        tranquilForestTheme: {
            "--background": "#1b4332", // Koyu orman yeşili arka plan
            "--light-background": "#265941", // Orta koyu yeşil yüzey
            "--surface": "#316f51", // Koyu yeşil yüzey
            "--primary-text": "#d0e0d0", // Açık yeşil-gri metin
            "--secondary-text": "#a0b0a0", // Orta yeşil-gri metin
            "--dark-text": "#ffffff", // Beyaz metin
            "--divider": "#417f61", // Koyu yeşil bölücü
            "--shadow": "rgba(27, 67, 50, 0.7)", // Şeffaf koyu yeşil gölge
            "--primary": "#66bb6a", // Açık yeşil
            "--secondary": "#aed581", // Açık yeşil-sarı
            "--warning": "#e5c07b", // Sarımsı turuncu
            "--error": "#e06c75", // Kırmızımsı pembe
            "--info": "#56b6c2", // Açık mavi-yeşil
            "--success": "#98c379", // Yeşilimsi sarı
            "--dropdown-box-shadow": "rgba(102, 187, 106, 0.5)", // Şeffaf açık yeşil
            "--group-card-hover": "#265941", // Orta koyu yeşil
            "--seperator": "#417f61", // Koyu yeşil
            "--select-background-color": "#316f51", // Koyu yeşil
            "--select-text-color": "#d0e0d0", // Açık yeşil-gri
            "--select-focus-border-color": "#66bb6a", // Açık yeşil
            "--select-focus-box-shadow": "rgba(102, 187, 106, 0.3)", // Şeffaf açık yeşil
        },
        darkNebulaTheme: {
            "--background": "#000000", // Siyah arka plan
            "--light-background": "#121212", // Çok koyu gri yüzey
            "--surface": "#1e1e1e", // Koyu gri yüzey
            "--primary-text": "#e0e0e0", // Açık gri metin
            "--secondary-text": "#b0b0b0", // Orta gri metin
            "--dark-text": "#ffffff", // Beyaz metin
            "--divider": "#2e2e2e", // Koyu gri bölücü
            "--shadow": "rgba(0, 0, 0, 0.8)", // Şeffaf siyah gölge
            "--primary": "#673ab7", // Mor
            "--secondary": "#3f51b5", // Indigo
            "--warning": "#ffeb3b", // Sarı
            "--error": "#f44336", // Kırmızı
            "--info": "#2196f3", // Mavi
            "--success": "#4caf50", // Yeşil
            "--dropdown-box-shadow": "rgba(103, 58, 183, 0.5)", // Şeffaf mor
            "--group-card-hover": "#121212", // Çok koyu gri
            "--seperator": "#2e2e2e", // Koyu gri
            "--select-background-color": "#1e1e1e", // Koyu gri
            "--select-text-color": "#e0e0e0", // Açık gri
            "--select-focus-border-color": "#673ab7", // Mor
            "--select-focus-box-shadow": "rgba(103, 58, 183, 0.3)", // Şeffaf mor
        },
        shadowWalkerTheme: {
            "--background": "#000000", // Siyah arka plan
            "--light-background": "#181818", // Çok koyu gri yüzey
            "--surface": "#212121", // Koyu gri yüzey
            "--primary-text": "#bdbdbd", // Açık gri metin
            "--secondary-text": "#757575", // Orta gri metin
            "--dark-text": "#ffffff", // Beyaz metin
            "--divider": "#424242", // Koyu gri bölücü
            "--shadow": "rgba(0, 0, 0, 0.7)", // Şeffaf siyah gölge
            "--primary": "#9c27b0", // Mor
            "--secondary": "#7b1fa2", // Koyu mor
            "--warning": "#ffb74d", // Açık turuncu
            "--error": "#f44336", // Kırmızı
            "--info": "#29b6f6", // Açık mavi
            "--success": "#4caf50", // Yeşil
            "--dropdown-box-shadow": "rgba(156, 39, 176, 0.5)", // Şeffaf mor
            "--group-card-hover": "#181818", // Çok koyu gri
            "--seperator": "#424242", // Koyu gri
            "--select-background-color": "#212121", // Koyu gri
            "--select-text-color": "#bdbdbd", // Açık gri
            "--select-focus-border-color": "#9c27b0", // Mor
            "--select-focus-box-shadow": "rgba(156, 39, 176, 0.3)", // Şeffaf mor
        },
        obsidianNightTheme: {
            "--background": "#121212", // Siyah arka plan
            "--light-background": "#1f1f1f", // Koyu gri yüzey
            "--surface": "#262626", // Orta koyu gri yüzey
            "--primary-text": "#e0e0e0", // Açık gri metin
            "--secondary-text": "#b0b0b0", // Orta gri metin
            "--dark-text": "#ffffff", // Beyaz metin
            "--divider": "#333333", // Koyu gri bölücü
            "--shadow": "rgba(18, 18, 18, 0.7)", // Şeffaf siyah gölge
            "--primary": "#3498db", // Parlak mavi
            "--secondary": "#95a5a6", // Açık gri
            "--warning": "#f39c12", // Turuncu
            "--error": "#e74c3c", // Kırmızı
            "--info": "#29b6f6", // Açık mavi
            "--success": "#2ecc71", // Yeşil
            "--dropdown-box-shadow": "rgba(52, 152, 219, 0.5)", // Şeffaf parlak mavi
            "--group-card-hover": "#1f1f1f", // Koyu gri
            "--seperator": "#333333", // Koyu gri
            "--select-background-color": "#262626", // Orta koyu gri
            "--select-text-color": "#e0e0e0", // Açık gri
            "--select-focus-border-color": "#3498db", // Parlak mavi
            "--select-focus-box-shadow": "rgba(52, 152, 219, 0.3)", // Şeffaf parlak mavi
        },

        cyberpunkHazeTheme: {
            "--background": "#271845", // Koyu mor arka plan
            "--light-background": "#392368", // Orta koyu mor yüzey
            "--surface": "#49328a", // Mor yüzey
            "--primary-text": "#e0e0e0", // Açık gri metin
            "--secondary-text": "#b0b0b0", // Orta gri metin
            "--dark-text": "#ffffff", // Beyaz metin
            "--divider": "#5c419d", // Koyu mor bölücü
            "--shadow": "rgba(39, 24, 69, 0.7)", // Şeffaf koyu mor gölge
            "--primary": "#00ffff", // Parlak mavi
            "--secondary": "#ff00ff", // Parlak pembe
            "--warning": "#ffea00", // Parlak sarı
            "--error": "#ff3300", // Parlak kırmızı
            "--info": "#64d2ff", // Açık mavi
            "--success": "#76ff03", // Parlak yeşil
            "--dropdown-box-shadow": "rgba(0, 255, 255, 0.5)", // Şeffaf parlak mavi
            "--group-card-hover": "#392368", // Orta koyu mor
            "--seperator": "#5c419d", // Koyu mor
            "--select-background-color": "#49328a", // Mor
            "--select-text-color": "#e0e0e0", // Açık gri
            "--select-focus-border-color": "#00ffff", // Parlak mavi
            "--select-focus-box-shadow": "rgba(0, 255, 255, 0.3)", // Şeffaf parlak mavi
        },
        emeraldCityTheme: {
            "--background": "#1b5e20", // Koyu yeşil arka plan
            "--light-background": "#2e7d32", // Orta koyu yeşil yüzey
            "--surface": "#388e3c", // Koyu yeşil yüzey
            "--primary-text": "#ffffff", // Beyaz metin
            "--secondary-text": "#e0f2f1", // Açık yeşil metin
            "--dark-text": "#000000", // Siyah metin
            "--divider": "#43a047", // Koyu yeşil bölücü
            "--shadow": "rgba(27, 94, 32, 0.7)", // Şeffaf koyu yeşil gölge
            "--primary": "#ffd700", // Altın sarısı
            "--secondary": "#d4af37", // Koyu altın sarısı
            "--warning": "#ffcc80", // Açık turuncu
            "--error": "#f44336", // Kırmızı
            "--info": "#4fc3f7", // Açık mavi
            "--success": "#66bb6a", // Açık yeşil
            "--dropdown-box-shadow": "rgba(255, 215, 0, 0.5)", // Şeffaf altın sarısı
            "--group-card-hover": "#2e7d32", // Orta koyu yeşil
            "--seperator": "#43a047", // Koyu yeşil
            "--select-background-color": "#388e3c", // Koyu yeşil
            "--select-text-color": "#ffffff", // Beyaz
            "--select-focus-border-color": "#ffd700", // Altın sarısı
            "--select-focus-box-shadow": "rgba(255, 215, 0, 0.3)", // Şeffaf altın sarısı
        },
        crimsonTideTheme: {
            "--background": "#260000", // Koyu kırmızı arka plan
            "--light-background": "#330000", // Orta koyu kırmızı yüzey
            "--surface": "#400000", // Koyu kırmızı yüzey
            "--primary-text": "#ffffff", // Beyaz metin
            "--secondary-text": "#cccccc", // Açık gri metin
            "--dark-text": "#000000", // Siyah metin
            "--divider": "#590000", // Koyu kırmızı bölücü
            "--shadow": "rgba(38, 0, 0, 0.7)", // Şeffaf koyu kırmızı gölge
            "--primary": "#ff5252", // Parlak kırmızı
            "--secondary": "#ff8a80", // Açık kırmızı
            "--warning": "#ffab40", // Turuncu
            "--error": "#ff1744", // Koyu kırmızı
            "--info": "#64b5f6", // Açık mavi
            "--success": "#4caf50", // Yeşil
            "--dropdown-box-shadow": "rgba(255, 82, 82, 0.5)", // Şeffaf parlak kırmızı
            "--group-card-hover": "#330000", // Orta koyu kırmızı
            "--seperator": "#590000", // Koyu kırmızı
            "--select-background-color": "#400000", // Koyu kırmızı
            "--select-text-color": "#ffffff", // Beyaz
            "--select-focus-border-color": "#ff5252", // Parlak kırmızı
            "--select-focus-box-shadow": "rgba(255, 82, 82, 0.3)", // Şeffaf parlak kırmızı
        },

        nightOwlTheme: {
            "--background": "#1e222a", // Koyu mavi-gri arka plan
            "--light-background": "#282c34", // Orta koyu mavi-gri yüzey
            "--surface": "#353b45", // Orta mavi-gri yüzey
            "--primary-text": "#abb2bf", // Açık gri-mavi metin
            "--secondary-text": "#778da9", // Orta gri-mavi metin
            "--dark-text": "#ffffff", // Beyaz metin
            "--divider": "#4b5668", // Koyu gri-mavi bölücü
            "--shadow": "rgba(20, 24, 30, 0.7)", // Şeffaf koyu mavi-gri gölge
            "--primary": "#61afef", // Parlak mavi
            "--secondary": "#c678dd", // Açık mor
            "--warning": "#e5c07b", // Sarımsı turuncu
            "--error": "#e06c75", // Kırmızımsı pembe
            "--info": "#56b6c2", // Açık mavi-yeşil
            "--success": "#98c379", // Yeşilimsi sarı
            "--dropdown-box-shadow": "rgba(97, 175, 239, 0.5)", // Şeffaf parlak mavi
            "--group-card-hover": "#282c34", // Orta koyu mavi-gri
            "--seperator": "#4b5668", // Koyu gri-mavi
            "--select-background-color": "#353b45", // Orta mavi-gri
            "--select-text-color": "#abb2bf", // Açık gri-mavi
            "--select-focus-border-color": "#61afef", // Parlak mavi
            "--select-focus-box-shadow": "rgba(97, 175, 239, 0.3)", // Şeffaf parlak mavi
        },
        darkSteelBlueTheme: {
            "--background": "#121212",
            "--light-background": "#1e1e1e",
            "--surface": "#2a2a2a",
            "--primary-text": "#e0e0e0",
            "--secondary-text": "#b0b0b0",
            "--dark-text": "#ffffff",
            "--divider": "#3f3f3f",
            "--shadow": "rgba(18, 18, 18, 0.7)",
            "--primary": "#607d8b",
            "--secondary": "#78909c",
            "--warning": "#ffb300",
            "--error": "#e53935",
            "--info": "#0288d1",
            "--success": "#43a047",
            "--dropdown-box-shadow": "rgba(96, 125, 139, 0.7)",
            "--group-card-hover": "#1e1e1e",
            "--seperator": "#3f3f3f",
            "--select-background-color": "#2a2a2a",
            "--select-text-color": "#e0e0e0",
            "--select-focus-border-color": "#607d8b",
            "--select-focus-box-shadow": "rgba(96, 125, 139, 0.3)",
        },
        blackAndWhiteTheme: {
            "--background": "#000000" /* Black background */,
            "--light-background": "#ffffff" /* White surface */,
            "--surface": "#f0f0f0" /* Light gray surface */,
            "--primary-text": "#000000" /* White primary text */,
            "--secondary-text": "#bdbdbd" /* Light gray secondary text */,
            "--dark-text": "#000000" /* Black text */,
            "--divider": "#4f4f4f" /* Dark gray divider */,
            "--shadow": "rgba(0, 0, 0, 0.7)" /* Black shadow */,
            "--primary": "#ffffff" /* White primary color */,
            "--secondary": "#bdbdbd" /* Light gray secondary color */,
            "--warning": "#ffc107" /* Yellow warning color */,
            "--error": "#f44336" /* Red error color */,
            "--info": "#2196f3" /* Blue info color */,
            "--success": "#4caf50" /* Green success color */,
            "--dropdown-box-shadow":
                "rgba(255, 255, 255, 0.7)" /* White shadow */,
            "--group-card-hover": "#1a1a1a" /* Dark gray card hover color */,
            "--separator": "#4f4f4f" /* Dark gray separator */,
            "--select-background-color":
                "#2e2e2e" /* Dark gray select background color */,
            "--select-text-color": "#ffffff" /* White select text color */,
            "--select-focus-border-color":
                "#ffffff" /* White focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 255, 255, 0.3)" /* White focus shadow */,
        },

        fedoraTheme: {
            "--background": "#2c3e50" /* Dark blue-gray background */,
            "--light-background": "#ffffff" /* White surface */,
            "--surface": "#e0e0e0" /* Light gray surface */,
            "--primary-text": "#333333" /* Dark gray primary text */,
            "--secondary-text": "#777777" /* Medium gray secondary text */,
            "--dark-text": "#000000" /* Black text */,
            "--divider": "#d0d0d0" /* Medium light gray divider */,
            "--shadow": "rgba(0, 0, 0, 0.15)" /* Light shadow */,
            "--primary": "#294172" /* Bright blue primary color */,
            "--secondary": "#0056a3" /* Dark blue secondary color */,
            "--tertiary": "#003366" /* Dark blue tertiary color */,
            "--quaternary": "#ffffff" /* White quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#ff3b30" /* Red error color */,
            "--info": "#5ac8fa" /* Cyan info color */,
            "--success": "#4cd964" /* Green success color */,
            "--dropdown-box-shadow":
                "rgba(41, 65, 114, 0.7)" /* Bright blue shadow */,
            "--group-card-hover": "#e0e0e0" /* Light gray card hover color */,
            "--separator": "#d0d0d0" /* Medium light gray separator */,
            "--select-background-color":
                "#ffffff" /* White select background color */,
            "--select-text-color": "#333333" /* Dark gray select text color */,
            "--select-focus-border-color":
                "#294172" /* Bright blue focus border color */,
            "--select-focus-box-shadow":
                "rgba(41, 65, 114, 0.3)" /* Bright blue focus shadow */,
        },
        openSuseTheme: {
            "--background": "#1e1e1e" /* Dark gray background */,
            "--light-background": "#ffffff" /* White surface */,
            "--surface": "#e0e0e0" /* Light gray surface */,
            "--primary-text": "#333333" /* Dark gray primary text */,
            "--secondary-text": "#777777" /* Medium gray secondary text */,
            "--dark-text": "#000000" /* Black text */,
            "--divider": "#d0d0d0" /* Medium light gray divider */,
            "--shadow": "rgba(0, 0, 0, 0.15)" /* Light shadow */,
            "--primary": "#73ba25" /* Bright green primary color */,
            "--secondary": "#8bc34a" /* Light green secondary color */,
            "--tertiary": "#558b2f" /* Dark green tertiary color */,
            "--quaternary": "#ffffff" /* White quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#ff3b30" /* Red error color */,
            "--info": "#5ac8fa" /* Cyan info color */,
            "--success": "#4cd964" /* Green success color */,
            "--dropdown-box-shadow":
                "rgba(115, 186, 37, 0.7)" /* Bright green shadow */,
            "--group-card-hover": "#e0e0e0" /* Light gray card hover color */,
            "--separator": "#d0d0d0" /* Medium light gray separator */,
            "--select-background-color":
                "#ffffff" /* White select background color */,
            "--select-text-color": "#333333" /* Dark gray select text color */,
            "--select-focus-border-color":
                "#73ba25" /* Bright green focus border color */,
            "--select-focus-box-shadow":
                "rgba(115, 186, 37, 0.3)" /* Bright green focus shadow */,
        },

        iceBlueTheme: {
            "--background": "#f0f8ff",
            "--light-background": "#ffffff",
            "--surface": "#e0eaf0",
            "--primary-text": "#2c3e50",
            "--secondary-text": "#7f8c8d",
            "--dark-text": "#000000",
            "--divider": "#bdc3c7",
            "--shadow": "rgba(44, 62, 80, 0.1)",
            "--primary": "#3498db",
            "--secondary": "#95a5a6",
            "--warning": "#f39c12",
            "--error": "#e74c3c",
            "--info": "#1abc9c",
            "--success": "#2ecc71",
            "--dropdown-box-shadow": "rgba(52, 152, 219, 0.3)",
            "--group-card-hover": "#ecf0f1",
            "--seperator": "#bdc3c7",
            "--select-background-color": "#f0f8ff",
            "--select-text-color": "#2c3e50",
            "--select-focus-border-color": "#3498db",
            "--select-focus-box-shadow": "rgba(52, 152, 219, 0.3)",
        },
        arcticIceTheme: {
            "--background": "#f0f4f8" /* Very light ice blue background */,
            "--light-background": "#ffffff" /* White surface */,
            "--surface": "#d9e2ec" /* Light ice blue surface */,
            "--primary-text": "#102a43" /* Dark blue primary text */,
            "--secondary-text": "#334e68" /* Medium dark blue secondary text */,
            "--dark-text": "#000000" /* Black text */,
            "--divider": "#bcccdc" /* Light blue divider */,
            "--shadow":
                "rgba(240, 244, 248, 0.7)" /* Very light ice blue shadow */,
            "--primary": "#627d98" /* Light steel blue primary color */,
            "--secondary": "#9fb3c8" /* Light blue secondary color */,
            "--tertiary": "#bcccdc" /* Light blue tertiary color */,
            "--quaternary": "#d9e2ec" /* Very light blue quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(98, 125, 152, 0.7)" /* Light steel blue shadow */,
            "--group-card-hover": "#ffffff" /* White card hover color */,
            "--separator": "#bcccdc" /* Light blue separator */,
            "--select-background-color":
                "#f0f4f8" /* Very light ice blue select background color */,
            "--select-text-color": "#102a43" /* Dark blue select text color */,
            "--select-focus-border-color":
                "#627d98" /* Light steel blue focus border color */,
            "--select-focus-box-shadow":
                "rgba(98, 125, 152, 0.3)" /* Light steel blue focus shadow */,
        },

        snowyOwlTheme: {
            "--background": "#f5f5f5" /* Very light gray background */,
            "--light-background": "#ffffff" /* White surface */,
            "--surface": "#e0e0e0" /* Light gray surface */,
            "--primary-text": "#212121" /* Dark gray primary text */,
            "--secondary-text": "#757575" /* Medium gray secondary text */,
            "--dark-text": "#000000" /* Black text */,
            "--divider": "#bdbdbd" /* Medium light gray divider */,
            "--shadow": "rgba(245, 245, 245, 0.7)" /* Very light gray shadow */,
            "--primary": "#9e9e9e" /* Medium gray primary color */,
            "--secondary": "#cfd8dc" /* Light gray-blue secondary color */,
            "--tertiary": "#b0bec5" /* Light gray-blue tertiary color */,
            "--quaternary":
                "#eceff1" /* Very light gray-blue quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(158, 158, 158, 0.7)" /* Medium gray shadow */,
            "--group-card-hover": "#e0e0e0" /* Light gray card hover color */,
            "--separator": "#bdbdbd" /* Medium light gray separator */,
            "--select-background-color":
                "#ffffff" /* White select background color */,
            "--select-text-color": "#212121" /* Dark gray select text color */,
            "--select-focus-border-color":
                "#9e9e9e" /* Medium gray focus border color */,
            "--select-focus-box-shadow":
                "rgba(158, 158, 158, 0.3)" /* Medium gray focus shadow */,
        },

        blueSkyTheme: {
            "--background": "#e3f2fd",
            "--light-background": "#ffffff",
            "--surface": "#bbdefb",
            "--primary-text": "#0d47a1",
            "--secondary-text": "#5472d3",
            "--dark-text": "#002171",
            "--divider": "#90caf9",
            "--shadow": "rgba(13, 71, 161, 0.25)",
            "--primary": "#1e88e5",
            "--secondary": "#64b5f6",
            "--warning": "#ffca28",
            "--error": "#e53935",
            "--info": "#29b6f6",
            "--success": "#66bb6a",
            "--dropdown-box-shadow": "rgba(30, 136, 229, 0.7)",
            "--group-card-hover": "#e1f5fe",
            "--seperator": "#b3e5fc",
            "--select-background-color": "#e3f2fd",
            "--select-text-color": "#0d47a1",
            "--select-focus-border-color": "#1e88e5",
            "--select-focus-box-shadow": "rgba(30, 136, 229, 0.3)",
        },

        lightBlueTheme: {
            "--background": "#e0f7fa",
            "--light-background": "#ffffff",
            "--surface": "#b2ebf2",
            "--primary-text": "#004d40",
            "--secondary-text": "#00796b",
            "--dark-text": "#00251a",
            "--divider": "#80deea",
            "--shadow": "rgba(0, 77, 64, 0.25)",
            "--primary": "#00796b",
            "--secondary": "#004d40",
            "--warning": "#ffb74d",
            "--error": "#e57373",
            "--info": "#64b5f6",
            "--success": "#81c784",
            "--dropdown-box-shadow": "rgba(0, 121, 107, 0.7)",
            "--group-card-hover": "#b2dfdb",
            "--seperator": "#80cbc4",
            "--select-background-color": "#e0f2f1",
            "--select-text-color": "#004d40",
            "--select-focus-border-color": "#00796b",
            "--select-focus-box-shadow": "rgba(0, 121, 107, 0.3)",
        },

        desertOasisTheme: {
            "--background": "#3e2723" /* Deep brown background */,
            "--light-background": "#5d4037" /* Medium brown surface */,
            "--surface": "#ffcc80" /* Light orange surface */,
            "--primary-text": "#ffffff" /* White primary text */,
            "--secondary-text": "#ffe0b2" /* Light orange secondary text */,
            "--dark-text": "#000000" /* Black text */,
            "--divider": "#ffab91" /* Light orange divider */,
            "--shadow": "rgba(62, 39, 35, 0.7)" /* Deep brown shadow */,
            "--primary": "#ff9800" /* Bright orange primary color */,
            "--secondary": "#ffb74d" /* Light orange secondary color */,
            "--tertiary": "#ffcc80" /* Pale orange tertiary color */,
            "--quaternary": "#ffa726" /* Bright orange quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(255, 152, 0, 0.7)" /* Bright orange shadow */,
            "--group-card-hover": "#5d4037" /* Medium brown card hover color */,
            "--separator": "#ffab91" /* Light orange separator */,
            "--select-background-color":
                "#ffcc80" /* Light orange select background color */,
            "--select-text-color": "#ffffff" /* White select text color */,
            "--select-focus-border-color":
                "#ff9800" /* Bright orange focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 152, 0, 0.3)" /* Bright orange focus shadow */,
        },

        coralTheme: {
            "--background": "#ff6f61",
            "--light-background": "#ffe6e1",
            "--surface": "#ffcccb",
            "--primary-text": "#4e342e",
            "--secondary-text": "#795548",
            "--dark-text": "#3e2723",
            "--divider": "#ffab91",
            "--shadow": "rgba(255, 111, 97, 0.5)",
            "--primary": "#ff5722",
            "--secondary": "#ff8a65",
            "--warning": "#ffa726",
            "--error": "#e53935",
            "--info": "#4fc3f7",
            "--success": "#66bb6a",
            "--dropdown-box-shadow": "rgba(255, 87, 34, 0.7)",
            "--group-card-hover": "#ffab91",
            "--seperator": "#ffcccb",
            "--select-background-color": "#ffe6e1",
            "--select-text-color": "#4e342e",
            "--select-focus-border-color": "#ff5722",
            "--select-focus-box-shadow": "rgba(255, 87, 34, 0.3)",
        },
        candylandTheme: {
            "--background": "#ff6f61" /* Bright coral background */,
            "--light-background": "#ffb5a7" /* Light coral surface */,
            "--surface": "#ff6f61" /* Bright coral surface */,
            "--primary-text": "#ffffff" /* White primary text */,
            "--secondary-text": "#ffc1c1" /* Light pink secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#ff9a8d" /* Light pink divider */,
            "--shadow": "rgba(255, 111, 97, 0.5)" /* Bright coral shadow */,
            "--primary": "#ff6f61" /* Bright coral primary color */,
            "--secondary": "#ffcccb" /* Light pink secondary color */,
            "--tertiary": "#ff99ff" /* Light magenta tertiary color */,
            "--quaternary": "#ff33ff" /* Bright magenta quaternary color */,
            "--warning": "#ffcc00" /* Bright orange warning color */,
            "--error": "#ff0033" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(255, 111, 97, 0.7)" /* Bright coral shadow */,
            "--group-card-hover": "#ffb5a7" /* Light coral card hover color */,
            "--separator": "#ff9a8d" /* Light pink separator */,
            "--select-background-color":
                "#ff6f61" /* Bright coral select background color */,
            "--select-text-color": "#ffffff" /* White select text color */,
            "--select-focus-border-color":
                "#ff6f61" /* Bright coral focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 111, 97, 0.3)" /* Bright coral focus shadow */,
        },
        cyberSunsetTheme: {
            "--background": "#1f1f1f" /* Dark gray background */,
            "--light-background": "#2e2e2e" /* Dark gray surface */,
            "--surface": "#ff6f61" /* Bright coral surface */,
            "--primary-text": "#ffffff" /* White primary text */,
            "--secondary-text": "#ffcccb" /* Light pink secondary text */,
            "--dark-text": "#000000" /* Black text */,
            "--divider": "#ff9a8d" /* Light pink divider */,
            "--shadow": "rgba(31, 31, 31, 0.7)" /* Dark gray shadow */,
            "--primary": "#ff6f61" /* Bright coral primary color */,
            "--secondary": "#ffcccb" /* Light pink secondary color */,
            "--tertiary": "#ffc107" /* Amber tertiary color */,
            "--quaternary": "#ff9800" /* Bright orange quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(255, 111, 97, 0.7)" /* Bright coral shadow */,
            "--group-card-hover": "#2e2e2e" /* Dark gray card hover color */,
            "--separator": "#ff9a8d" /* Light pink separator */,
            "--select-background-color":
                "#ff6f61" /* Bright coral select background color */,
            "--select-text-color": "#ffffff" /* White select text color */,
            "--select-focus-border-color":
                "#ff6f61" /* Bright coral focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 111, 97, 0.3)" /* Bright coral focus shadow */,
        },
        brightOrangeTheme: {
            "--background": "#ff7043",
            "--light-background": "#ff8a65",
            "--surface": "#ffab91",
            "--primary-text": "#4e342e",
            "--secondary-text": "#6d4c41",
            "--dark-text": "#3e2723",
            "--divider": "#ffccbc",
            "--shadow": "rgba(255, 112, 67, 0.5)",
            "--primary": "#ff5722",
            "--secondary": "#ff7043",
            "--warning": "#ffeb3b",
            "--error": "#d32f2f",
            "--info": "#29b6f6",
            "--success": "#81c784",
            "--dropdown-box-shadow": "rgba(255, 87, 34, 0.7)",
            "--group-card-hover": "#ff8a65",
            "--seperator": "#ffccbc",
            "--select-background-color": "#ffab91",
            "--select-text-color": "#4e342e",
            "--select-focus-border-color": "#ff5722",
            "--select-focus-box-shadow": "rgba(255, 87, 34, 0.3)",
        },
        sunsetOrangeTheme: {
            "--background": "#ff7043" /* Sunset orange background */,
            "--light-background": "#ff8a65" /* Light sunset orange surface */,
            "--surface": "#ff7043" /* Sunset orange surface */,
            "--primary-text": "#3e2723" /* Dark brown primary text */,
            "--secondary-text": "#795548" /* Medium brown secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#ffccbc" /* Light orange divider */,
            "--shadow": "rgba(255, 112, 67, 0.5)" /* Sunset orange shadow */,
            "--primary": "#ff7043" /* Sunset orange primary color */,
            "--secondary": "#ffccbc" /* Light orange secondary color */,
            "--warning": "#ffa726" /* Bright orange warning color */,
            "--error": "#e53935" /* Bright red error color */,
            "--info": "#29b6f6" /* Bright blue info color */,
            "--success": "#66bb6a" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(255, 112, 67, 0.7)" /* Sunset orange shadow */,
            "--group-card-hover":
                "#ff8a65" /* Light sunset orange card hover color */,
            "--separator": "#ffccbc" /* Light orange separator */,
            "--select-background-color":
                "#ff7043" /* Sunset orange select background color */,
            "--select-text-color": "#3e2723" /* Dark brown select text color */,
            "--select-focus-border-color":
                "#ff7043" /* Sunset orange focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 112, 67, 0.3)" /* Sunset orange focus shadow */,
        },
        toyStoryTheme: {
            "--background": "#ffeb3b" /* Bright yellow background */,
            "--light-background": "#fff176" /* Light yellow surface */,
            "--surface": "#ffeb3b" /* Bright yellow surface */,
            "--primary-text": "#000000" /* Black primary text */,
            "--secondary-text": "#424242" /* Medium gray secondary text */,
            "--dark-text": "#000000" /* Black text */,
            "--divider": "#ffcc00" /* Medium yellow divider */,
            "--shadow": "rgba(255, 235, 59, 0.7)" /* Bright yellow shadow */,
            "--primary": "#ff5722" /* Bright orange primary color */,
            "--secondary": "#ff9800" /* Bright orange secondary color */,
            "--tertiary": "#ffc107" /* Bright yellow tertiary color */,
            "--quaternary": "#ffeb3b" /* Bright yellow quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(255, 87, 34, 0.7)" /* Bright orange shadow */,
            "--group-card-hover": "#fff176" /* Light yellow card hover color */,
            "--separator": "#ffcc00" /* Medium yellow separator */,
            "--select-background-color":
                "#ffeb3b" /* Bright yellow select background color */,
            "--select-text-color": "#000000" /* Black select text color */,
            "--select-focus-border-color":
                "#ff5722" /* Bright orange focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 87, 34, 0.3)" /* Bright orange focus shadow */,
        },
        lionKingTheme: {
            "--background": "#f57c00" /* Deep orange background */,
            "--light-background": "#fb8c00" /* Medium orange surface */,
            "--surface": "#f57c00" /* Deep orange surface */,
            "--primary-text": "#ffffff" /* White primary text */,
            "--secondary-text": "#ffcc80" /* Light orange secondary text */,
            "--dark-text": "#000000" /* Black text */,
            "--divider": "#ffa726" /* Medium orange divider */,
            "--shadow": "rgba(245, 124, 0, 0.7)" /* Deep orange shadow */,
            "--primary": "#ffeb3b" /* Bright yellow primary color */,
            "--secondary": "#ffd54f" /* Light yellow secondary color */,
            "--tertiary": "#ffeb3b" /* Bright yellow tertiary color */,
            "--quaternary": "#fdd835" /* Bright yellow quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(255, 235, 59, 0.7)" /* Bright yellow shadow */,
            "--group-card-hover":
                "#fb8c00" /* Medium orange card hover color */,
            "--separator": "#ffa726" /* Medium orange separator */,
            "--select-background-color":
                "#f57c00" /* Deep orange select background color */,
            "--select-text-color": "#ffffff" /* White select text color */,
            "--select-focus-border-color":
                "#ffeb3b" /* Bright yellow focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 235, 59, 0.3)" /* Bright yellow focus shadow */,
        },
        lavenderPurpleTheme: {
            "--background": "#9575cd" /* Lavender purple background */,
            "--light-background": "#d1c4e9" /* Light lavender purple surface */,
            "--surface": "#9575cd" /* Lavender purple surface */,
            "--primary-text": "#ffffff" /* White primary text */,
            "--secondary-text": "#e1bee7" /* Light purple secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#b39ddb" /* Light purple divider */,
            "--shadow": "rgba(149, 117, 205, 0.5)" /* Lavender purple shadow */,
            "--primary": "#9575cd" /* Lavender purple primary color */,
            "--secondary": "#b39ddb" /* Light purple secondary color */,
            "--warning": "#ffa726" /* Bright orange warning color */,
            "--error": "#d32f2f" /* Bright red error color */,
            "--info": "#29b6f6" /* Bright blue info color */,
            "--success": "#66bb6a" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(149, 117, 205, 0.7)" /* Lavender purple shadow */,
            "--group-card-hover":
                "#d1c4e9" /* Light lavender purple card hover color */,
            "--separator": "#b39ddb" /* Light purple separator */,
            "--select-background-color":
                "#9575cd" /* Lavender purple select background color */,
            "--select-text-color": "#ffffff" /* White select text color */,
            "--select-focus-border-color":
                "#9575cd" /* Lavender purple focus border color */,
            "--select-focus-box-shadow":
                "rgba(149, 117, 205, 0.3)" /* Lavender purple focus shadow */,
        },
        retroWaveTheme: {
            "--background": "#282828" /* Dark gray background */,
            "--light-background": "#404040" /* Medium dark gray surface */,
            "--surface": "#ff00ff" /* Neon pink surface */,
            "--primary-text": "#ffffff" /* White primary text */,
            "--secondary-text": "#d1d1d1" /* Light gray secondary text */,
            "--dark-text": "#000000" /* Black text */,
            "--divider": "#ff69b4" /* Hot pink divider */,
            "--shadow": "rgba(40, 40, 40, 0.7)" /* Dark gray shadow */,
            "--primary": "#ff00ff" /* Neon pink primary color */,
            "--secondary": "#ff69b4" /* Hot pink secondary color */,
            "--tertiary": "#00ffff" /* Neon cyan tertiary color */,
            "--quaternary": "#ffea00" /* Neon yellow quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(255, 0, 255, 0.7)" /* Neon pink shadow */,
            "--group-card-hover":
                "#404040" /* Medium dark gray card hover color */,
            "--separator": "#ff69b4" /* Hot pink separator */,
            "--select-background-color":
                "#ff00ff" /* Neon pink select background color */,
            "--select-text-color": "#ffffff" /* White select text color */,
            "--select-focus-border-color":
                "#ff00ff" /* Neon pink focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 0, 255, 0.3)" /* Neon pink focus shadow */,
        },
        fastAndfuriousTheme: {
            "--background": "#000000" /* Black background */,
            "--light-background": "#333333" /* Dark gray surface */,
            "--surface": "#ff0000" /* Bright red surface */,
            "--primary-text": "#ffffff" /* White primary text */,
            "--secondary-text": "#b0b0b0" /* Medium gray secondary text */,
            "--dark-text": "#000000" /* Black text */,
            "--divider": "#666666" /* Medium gray divider */,
            "--shadow": "rgba(0, 0, 0, 0.7)" /* Black shadow */,
            "--primary": "#ff0000" /* Bright red primary color */,
            "--secondary": "#ff9900" /* Bright orange secondary color */,
            "--tertiary": "#ff6600" /* Bright orange tertiary color */,
            "--quaternary": "#ff3300" /* Bright red quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#ff0033" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(255, 0, 0, 0.7)" /* Bright red shadow */,
            "--group-card-hover":
                "#1a1a1a" /* Very dark gray card hover color */,
            "--separator": "#666666" /* Medium gray separator */,
            "--select-background-color":
                "#000000" /* Black select background color */,
            "--select-text-color": "#ffffff" /* White select text color */,
            "--select-focus-border-color":
                "#ff0000" /* Bright red focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 0, 0, 0.3)" /* Bright red focus shadow */,
        },
        spiderManTheme: {
            "--background": "#2b2d42" /* Dark blue-gray background */,
            "--light-background": "#3a3d55" /* Medium blue-gray surface */,
            "--surface": "#ef233c" /* Bright red surface */,
            "--primary-text": "#ffffff" /* White primary text */,
            "--secondary-text": "#ffccd5" /* Light pink secondary text */,
            "--dark-text": "#000000" /* Black text */,
            "--divider": "#8d99ae" /* Medium gray divider */,
            "--shadow": "rgba(235, 35, 60, 0.7)" /* Bright red shadow */,
            "--primary": "#ef233c" /* Bright red primary color */,
            "--secondary": "#d90429" /* Dark red secondary color */,
            "--tertiary": "#ff0054" /* Bright pink tertiary color */,
            "--quaternary": "#8d99ae" /* Medium gray quaternary color */,
            "--warning": "#ffd700" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(239, 35, 60, 0.7)" /* Bright red shadow */,
            "--group-card-hover":
                "#3a3d55" /* Medium blue-gray card hover color */,
            "--separator": "#8d99ae" /* Medium gray separator */,
            "--select-background-color":
                "#ef233c" /* Bright red select background color */,
            "--select-text-color": "#ffffff" /* White select text color */,
            "--select-focus-border-color":
                "#ef233c" /* Bright red focus border color */,
            "--select-focus-box-shadow":
                "rgba(239, 35, 60, 0.3)" /* Bright red focus shadow */,
        },
        crimsonRedTheme: {
            "--background": "#b71c1c" /* Crimson red background */,
            "--light-background": "#e57373" /* Light crimson red surface */,
            "--surface": "#b71c1c" /* Crimson red surface */,
            "--primary-text": "#ffffff" /* White primary text */,
            "--secondary-text": "#ffcdd2" /* Light red secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#ef9a9a" /* Light red divider */,
            "--shadow": "rgba(183, 28, 28, 0.5)" /* Crimson red shadow */,
            "--primary": "#b71c1c" /* Crimson red primary color */,
            "--secondary": "#ef9a9a" /* Light red secondary color */,
            "--warning": "#ffa726" /* Bright orange warning color */,
            "--error": "#d32f2f" /* Bright red error color */,
            "--info": "#29b6f6" /* Bright blue info color */,
            "--success": "#66bb6a" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(183, 28, 28, 0.7)" /* Crimson red shadow */,
            "--group-card-hover":
                "#e57373" /* Light crimson red card hover color */,
            "--separator": "#ef9a9a" /* Light red separator */,
            "--select-background-color":
                "#b71c1c" /* Crimson red select background color */,
            "--select-text-color": "#ffffff" /* White select text color */,
            "--select-focus-border-color":
                "#b71c1c" /* Crimson red focus border color */,
            "--select-focus-box-shadow":
                "rgba(183, 28, 28, 0.3)" /* Crimson red focus shadow */,
        },
        ironManTheme: {
            "--background": "#1c1c1c" /* Dark charcoal background */,
            "--light-background": "#2e2e2e" /* Medium charcoal surface */,
            "--surface": "#b71c1c" /* Deep red surface */,
            "--primary-text": "#ffd700" /* Gold primary text */,
            "--secondary-text": "#ffec8b" /* Light gold secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#b8860b" /* Dark gold divider */,
            "--shadow": "rgba(183, 28, 28, 0.7)" /* Deep red shadow */,
            "--primary": "#b71c1c" /* Deep red primary color */,
            "--secondary": "#d32f2f" /* Medium red secondary color */,
            "--tertiary": "#ffeb3b" /* Bright yellow tertiary color */,
            "--quaternary": "#ff9800" /* Bright orange quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(183, 28, 28, 0.7)" /* Deep red shadow */,
            "--group-card-hover":
                "#2e2e2e" /* Medium charcoal card hover color */,
            "--separator": "#b8860b" /* Dark gold separator */,
            "--select-background-color":
                "#b71c1c" /* Deep red select background color */,
            "--select-text-color": "#ffd700" /* Gold select text color */,
            "--select-focus-border-color":
                "#b71c1c" /* Deep red focus border color */,
            "--select-focus-box-shadow":
                "rgba(183, 28, 28, 0.3)" /* Deep red focus shadow */,
        },
        wonderWomanTheme: {
            "--background": "#b71c1c" /* Deep red background */,
            "--light-background": "#d32f2f" /* Medium red surface */,
            "--surface": "#b71c1c" /* Deep red surface */,
            "--primary-text": "#ffffff" /* White primary text */,
            "--secondary-text": "#ffcdd2" /* Light pink secondary text */,
            "--dark-text": "#000000" /* Black text */,
            "--divider": "#e57373" /* Medium pink divider */,
            "--shadow": "rgba(183, 28, 28, 0.7)" /* Deep red shadow */,
            "--primary": "#ffeb3b" /* Bright yellow primary color */,
            "--secondary": "#ffd54f" /* Light yellow secondary color */,
            "--tertiary": "#ffeb3b" /* Bright yellow tertiary color */,
            "--quaternary": "#fdd835" /* Bright yellow quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(255, 235, 59, 0.7)" /* Bright yellow shadow */,
            "--group-card-hover": "#d32f2f" /* Medium red card hover color */,
            "--separator": "#e57373" /* Medium pink separator */,
            "--select-background-color":
                "#b71c1c" /* Deep red select background color */,
            "--select-text-color": "#ffffff" /* White select text color */,
            "--select-focus-border-color":
                "#ffeb3b" /* Bright yellow focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 235, 59, 0.3)" /* Bright yellow focus shadow */,
        },
        raspberrySorbetTheme: {
            "--background": "#880e4f" /* Deep raspberry background */,
            "--light-background": "#ad1457" /* Dark raspberry surface */,
            "--surface": "#880e4f" /* Deep raspberry surface */,
            "--primary-text": "#ffc1e3" /* Light pink primary text */,
            "--secondary-text": "#ff80ab" /* Medium pink secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#d81b60" /* Dark pink divider */,
            "--shadow": "rgba(136, 14, 79, 0.7)" /* Deep raspberry shadow */,
            "--primary": "#f50057" /* Bright raspberry primary color */,
            "--secondary": "#ff4081" /* Bright pink secondary color */,
            "--tertiary": "#ff80ab" /* Light pink tertiary color */,
            "--quaternary": "#ff1744" /* Bright red quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(245, 0, 87, 0.7)" /* Bright raspberry shadow */,
            "--group-card-hover":
                "#ad1457" /* Dark raspberry card hover color */,
            "--separator": "#d81b60" /* Dark pink separator */,
            "--select-background-color":
                "#880e4f" /* Deep raspberry select background color */,
            "--select-text-color": "#ffc1e3" /* Light pink select text color */,
            "--select-focus-border-color":
                "#f50057" /* Bright raspberry focus border color */,
            "--select-focus-box-shadow":
                "rgba(245, 0, 87, 0.3)" /* Bright raspberry focus shadow */,
        },
        solarFlareTheme: {
            "--background": "#4a0000" /* Deep red background */,
            "--light-background": "#660000" /* Dark red surface */,
            "--surface": "#4a0000" /* Deep red surface */,
            "--primary-text": "#ffcccb" /* Light red primary text */,
            "--secondary-text": "#ffc1c1" /* Medium red secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#990000" /* Dark red divider */,
            "--shadow": "rgba(74, 0, 0, 0.7)" /* Deep red shadow */,
            "--primary": "#ff4500" /* Bright orange-red primary color */,
            "--secondary": "#ff6347" /* Bright tomato secondary color */,
            "--tertiary": "#ffa07a" /* Light salmon tertiary color */,
            "--quaternary": "#ff8c00" /* Dark orange quaternary color */,
            "--warning": "#ffa726" /* Bright orange warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#29b6f6" /* Bright blue info color */,
            "--success": "#66bb6a" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(255, 69, 0, 0.7)" /* Bright orange-red shadow */,
            "--group-card-hover": "#660000" /* Dark red card hover color */,
            "--separator": "#990000" /* Dark red separator */,
            "--select-background-color":
                "#4a0000" /* Deep red select background color */,
            "--select-text-color": "#ffcccb" /* Light red select text color */,
            "--select-focus-border-color":
                "#ff4500" /* Bright orange-red focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 69, 0, 0.3)" /* Bright orange-red focus shadow */,
        },
        acidGreenTheme: {
            "--background": "#ccff00",
            "--light-background": "#e6ff80",
            "--surface": "#ccff99",
            "--primary-text": "#1b5e20",
            "--secondary-text": "#388e3c",
            "--dark-text": "#003300",
            "--divider": "#99cc00",
            "--shadow": "rgba(204, 255, 0, 0.5)",
            "--primary": "#76ff03",
            "--secondary": "#64dd17",
            "--warning": "#ffd600",
            "--error": "#d50000",
            "--info": "#00b0ff",
            "--success": "#00c853",
            "--dropdown-box-shadow": "rgba(118, 255, 3, 0.7)",
            "--group-card-hover": "#ccff99",
            "--seperator": "#ccff66",
            "--select-background-color": "#e6ff80",
            "--select-text-color": "#1b5e20",
            "--select-focus-border-color": "#76ff03",
            "--select-focus-box-shadow": "rgba(118, 255, 3, 0.3)",
        },
        emeraldGreenTheme: {
            "--background": "#2e7d32" /* Forest green background */,
            "--light-background": "#60ad5e" /* Light forest green surface */,
            "--surface": "#2e7d32" /* Forest green surface */,
            "--primary-text": "#ffffff" /* White primary text */,
            "--secondary-text": "#a5d6a7" /* Light green secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#66bb6a" /* Light green divider */,
            "--shadow": "rgba(46, 125, 50, 0.5)" /* Forest green shadow */,
            "--primary": "#2e7d32" /* Forest green primary color */,
            "--secondary": "#66bb6a" /* Light green secondary color */,
            "--warning": "#ffa726" /* Bright orange warning color */,
            "--error": "#e53935" /* Bright red error color */,
            "--info": "#29b6f6" /* Bright blue info color */,
            "--success": "#66bb6a" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(46, 125, 50, 0.7)" /* Forest green shadow */,
            "--group-card-hover":
                "#60ad5e" /* Light forest green card hover color */,
            "--separator": "#66bb6a" /* Light green separator */,
            "--select-background-color":
                "#2e7d32" /* Forest green select background color */,
            "--select-text-color": "#ffffff" /* White select text color */,
            "--select-focus-border-color":
                "#2e7d32" /* Forest green focus border color */,
            "--select-focus-box-shadow":
                "rgba(46, 125, 50, 0.3)" /* Forest green focus shadow */,
        },
        jurassicParkTheme: {
            "--background": "#2e7d32" /* Deep jungle green background */,
            "--light-background": "#388e3c" /* Medium jungle green surface */,
            "--surface": "#2e7d32" /* Deep jungle green surface */,
            "--primary-text": "#ffffff" /* White primary text */,
            "--secondary-text": "#a5d6a7" /* Light green secondary text */,
            "--dark-text": "#000000" /* Black text */,
            "--divider": "#66bb6a" /* Medium green divider */,
            "--shadow": "rgba(46, 125, 50, 0.7)" /* Deep jungle green shadow */,
            "--primary": "#ffcc00" /* Bright yellow primary color */,
            "--secondary": "#ffeb3b" /* Light yellow secondary color */,
            "--tertiary": "#fbc02d" /* Bright yellow tertiary color */,
            "--quaternary": "#f57c00" /* Bright orange quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(255, 204, 0, 0.7)" /* Bright yellow shadow */,
            "--group-card-hover":
                "#388e3c" /* Medium jungle green card hover color */,
            "--separator": "#66bb6a" /* Medium green separator */,
            "--select-background-color":
                "#2e7d32" /* Deep jungle green select background color */,
            "--select-text-color": "#ffffff" /* White select text color */,
            "--select-focus-border-color":
                "#ffcc00" /* Bright yellow focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 204, 0, 0.3)" /* Bright yellow focus shadow */,
        },
        moanaTheme: {
            "--background": "#00796b" /* Deep teal background */,
            "--light-background": "#009688" /* Bright teal surface */,
            "--surface": "#00796b" /* Deep teal surface */,
            "--primary-text": "#ffffff" /* White primary text */,
            "--secondary-text": "#80cbc4" /* Light teal secondary text */,
            "--dark-text": "#000000" /* Black text */,
            "--divider": "#004d40" /* Dark teal divider */,
            "--shadow": "rgba(0, 121, 107, 0.7)" /* Deep teal shadow */,
            "--primary": "#ff7043" /* Bright coral primary color */,
            "--secondary": "#ffab91" /* Light coral secondary color */,
            "--tertiary": "#ffca28" /* Bright yellow tertiary color */,
            "--quaternary": "#f57c00" /* Bright orange quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(255, 112, 67, 0.7)" /* Bright coral shadow */,
            "--group-card-hover": "#009688" /* Bright teal card hover color */,
            "--separator": "#004d40" /* Dark teal separator */,
            "--select-background-color":
                "#00796b" /* Deep teal select background color */,
            "--select-text-color": "#ffffff" /* White select text color */,
            "--select-focus-border-color":
                "#ff7043" /* Bright coral focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 112, 67, 0.3)" /* Bright coral focus shadow */,
        },
        forestGreenTheme: {
            "--background": "#0a3d2a" /* Dark green background */,
            "--light-background": "#1a4d3a" /* Dark green surface */,
            "--surface": "#2a5d4a" /* Medium green surface */,
            "--primary-text": "#d0e0d0" /* Light green-gray primary text */,
            "--secondary-text":
                "#a0b0a0" /* Medium green-gray secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#3a5d4a" /* Medium green-gray divider */,
            "--shadow": "rgba(10, 61, 42, 0.7)" /* Dark green shadow */,
            "--primary": "#26a69a" /* Bright turquoise primary color */,
            "--secondary": "#ff7043" /* Bright orange secondary color */,
            "--warning": "#ffa000" /* Bright orange warning color */,
            "--error": "#ef5350" /* Bright red error color */,
            "--info": "#42a5f5" /* Bright blue info color */,
            "--success": "#66bb6a" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(38, 166, 154, 0.5)" /* Primary color shadow */,
            "--group-card-hover": "#1a4d3a" /* Dark green card hover color */,
            "--separator": "#3a5d4a" /* Medium green-gray separator */,
            "--select-background-color":
                "#2a5d4a" /* Medium green select background color */,
            "--select-text-color":
                "#d0e0d0" /* Light green-gray select text color */,
            "--select-focus-border-color":
                "#26a69a" /* Primary color focus border */,
            "--select-focus-box-shadow":
                "rgba(38, 166, 154, 0.3)" /* Primary color focus shadow */,
        },
        mysticJadeTheme: {
            "--background": "#004d40" /* Deep jade green background */,
            "--light-background": "#00695c" /* Dark jade green surface */,
            "--surface": "#004d40" /* Deep jade green surface */,
            "--primary-text": "#e0f2f1" /* Light mint green primary text */,
            "--secondary-text":
                "#b2dfdb" /* Medium mint green secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#00796b" /* Dark teal divider */,
            "--shadow": "rgba(0, 77, 64, 0.7)" /* Deep jade green shadow */,
            "--primary": "#00e676" /* Bright mint green primary color */,
            "--secondary": "#1de9b6" /* Bright aqua secondary color */,
            "--tertiary": "#00e5ff" /* Bright cyan tertiary color */,
            "--quaternary": "#76ff03" /* Bright lime quaternary color */,
            "--warning": "#ffcc00" /* Bright orange warning color */,
            "--error": "#ff0033" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(0, 230, 118, 0.7)" /* Bright mint green shadow */,
            "--group-card-hover":
                "#00695c" /* Dark jade green card hover color */,
            "--separator": "#00796b" /* Dark teal separator */,
            "--select-background-color":
                "#004d40" /* Deep jade green select background color */,
            "--select-text-color":
                "#e0f2f1" /* Light mint green select text color */,
            "--select-focus-border-color":
                "#00e676" /* Bright mint green focus border color */,
            "--select-focus-box-shadow":
                "rgba(0, 230, 118, 0.3)" /* Bright mint green focus shadow */,
        },
        tropicalRainforestTheme: {
            "--background": "#004d40" /* Deep teal background */,
            "--light-background": "#00796b" /* Dark teal surface */,
            "--surface": "#004d40" /* Deep teal surface */,
            "--primary-text": "#e0f2f1" /* Light cyan primary text */,
            "--secondary-text": "#b2dfdb" /* Medium cyan secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#00796b" /* Dark teal divider */,
            "--shadow": "rgba(0, 77, 64, 0.7)" /* Deep teal shadow */,
            "--primary": "#00bfa5" /* Bright aqua primary color */,
            "--secondary": "#1de9b6" /* Bright teal secondary color */,
            "--tertiary": "#00e676" /* Bright green tertiary color */,
            "--quaternary": "#76ff03" /* Lime green quaternary color */,
            "--warning": "#ffa726" /* Bright orange warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#29b6f6" /* Bright blue info color */,
            "--success": "#66bb6a" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(0, 191, 165, 0.7)" /* Bright aqua shadow */,
            "--group-card-hover": "#00796b" /* Dark teal card hover color */,
            "--separator": "#00796b" /* Dark teal separator */,
            "--select-background-color":
                "#004d40" /* Deep teal select background color */,
            "--select-text-color": "#e0f2f1" /* Light cyan select text color */,
            "--select-focus-border-color":
                "#00bfa5" /* Bright aqua focus border color */,
            "--select-focus-box-shadow":
                "rgba(0, 191, 165, 0.3)" /* Bright aqua focus shadow */,
        },
        darkGreenTheme: {
            "--background": "#0a0f0d",
            "--light-background": "#1b2a23",
            "--surface": "#2e3d35",
            "--primary-text": "#d1e8e4",
            "--secondary-text": "#a7d4cb",
            "--dark-text": "#e0f2f1",
            "--divider": "#4b615c",
            "--shadow": "rgba(10, 15, 13, 0.7)",
            "--primary": "#26a69a",
            "--secondary": "#80cbc4",
            "--warning": "#ffab00",
            "--error": "#d50000",
            "--info": "#29b6f6",
            "--success": "#66bb6a",
            "--dropdown-box-shadow": "rgba(38, 166, 154, 0.7)",
            "--group-card-hover": "#1b2a23",
            "--seperator": "#4b615c",
            "--select-background-color": "#2e3d35",
            "--select-text-color": "#d1e8e4",
            "--select-focus-border-color": "#26a69a",
            "--select-focus-box-shadow": "rgba(38, 166, 154, 0.3)",
        },
        auroraBorealisTheme: {
            "--background": "#001f3f" /* Dark navy blue background */,
            "--light-background": "#00264d" /* Deep blue surface */,
            "--surface": "#001f3f" /* Dark navy blue surface */,
            "--primary-text": "#e0f7fa" /* Light cyan primary text */,
            "--secondary-text": "#80deea" /* Medium cyan secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#004d66" /* Deep cyan divider */,
            "--shadow": "rgba(0, 31, 63, 0.7)" /* Dark navy blue shadow */,
            "--primary": "#00e676" /* Bright green primary color */,
            "--secondary": "#1de9b6" /* Bright teal secondary color */,
            "--tertiary": "#ffeb3b" /* Bright yellow tertiary color */,
            "--quaternary": "#ff1744" /* Bright red quaternary color */,
            "--warning": "#ffc107" /* Bright orange warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#00bcd4" /* Bright cyan info color */,
            "--success": "#4caf50" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(0, 230, 118, 0.7)" /* Bright green shadow */,
            "--group-card-hover": "#00264d" /* Deep blue card hover color */,
            "--separator": "#004d66" /* Deep cyan separator */,
            "--select-background-color":
                "#001f3f" /* Dark navy blue select background color */,
            "--select-text-color": "#e0f7fa" /* Light cyan select text color */,
            "--select-focus-border-color":
                "#00e676" /* Bright green focus border color */,
            "--select-focus-box-shadow":
                "rgba(0, 230, 118, 0.3)" /* Bright green focus shadow */,
        },

        royalPurpleTheme: {
            "--background": "#6a1b9a" /* Royal purple background */,
            "--light-background": "#9c4dcc" /* Light royal purple surface */,
            "--surface": "#6a1b9a" /* Royal purple surface */,
            "--primary-text": "#ffffff" /* White primary text */,
            "--secondary-text": "#e1bee7" /* Light purple secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#ba68c8" /* Light purple divider */,
            "--shadow": "rgba(106, 27, 154, 0.5)" /* Royal purple shadow */,
            "--primary": "#6a1b9a" /* Royal purple primary color */,
            "--secondary": "#ba68c8" /* Light purple secondary color */,
            "--warning": "#ffa726" /* Bright orange warning color */,
            "--error": "#e53935" /* Bright red error color */,
            "--info": "#29b6f6" /* Bright blue info color */,
            "--success": "#66bb6a" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(106, 27, 154, 0.7)" /* Royal purple shadow */,
            "--group-card-hover":
                "#9c4dcc" /* Light royal purple card hover color */,
            "--separator": "#ba68c8" /* Light purple separator */,
            "--select-background-color":
                "#6a1b9a" /* Royal purple select background color */,
            "--select-text-color": "#ffffff" /* White select text color */,
            "--select-focus-border-color":
                "#6a1b9a" /* Royal purple focus border color */,
            "--select-focus-box-shadow":
                "rgba(106, 27, 154, 0.3)" /* Royal purple focus shadow */,
        },
        intensePurpleTheme: {
            "--background": "#2d0c57",
            "--light-background": "#3e165f",
            "--surface": "#563d7c",
            "--primary-text": "#e0e0e0",
            "--secondary-text": "#b0b0b0",
            "--dark-text": "#ffffff",
            "--divider": "#7851a9",
            "--shadow": "rgba(45, 12, 87, 0.7)",
            "--primary": "#9c27b0",
            "--secondary": "#ba68c8",
            "--warning": "#fbc02d",
            "--error": "#e53935",
            "--info": "#1e88e5",
            "--success": "#66bb6a",
            "--dropdown-box-shadow": "rgba(156, 39, 176, 0.7)",
            "--group-card-hover": "#4a148c",
            "--seperator": "#7b1fa2",
            "--select-background-color": "#3e165f",
            "--select-text-color": "#e0e0e0",
            "--select-focus-border-color": "#9c27b0",
            "--select-focus-box-shadow": "rgba(156, 39, 176, 0.3)",
        },
        harryPotterTheme: {
            "--background": "#4d2c91" /* Dark purple background */,
            "--light-background": "#5e3aa1" /* Medium dark purple surface */,
            "--surface": "#4d2c91" /* Dark purple surface */,
            "--primary-text": "#ffffff" /* White primary text */,
            "--secondary-text": "#d1c4e9" /* Light purple secondary text */,
            "--dark-text": "#000000" /* Black text */,
            "--divider": "#673ab7" /* Medium purple divider */,
            "--shadow": "rgba(77, 44, 145, 0.7)" /* Dark purple shadow */,
            "--primary": "#ffab00" /* Bright amber primary color */,
            "--secondary": "#ffcc80" /* Light amber secondary color */,
            "--tertiary": "#fdd835" /* Bright yellow tertiary color */,
            "--quaternary": "#ff6f00" /* Bright orange quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(255, 171, 0, 0.7)" /* Bright amber shadow */,
            "--group-card-hover":
                "#5e3aa1" /* Medium dark purple card hover color */,
            "--separator": "#673ab7" /* Medium purple separator */,
            "--select-background-color":
                "#4d2c91" /* Dark purple select background color */,
            "--select-text-color": "#ffffff" /* White select text color */,
            "--select-focus-border-color":
                "#ffab00" /* Bright amber focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 171, 0, 0.3)" /* Bright amber focus shadow */,
        },
        galacticPurpleTheme: {
            "--background": "#2e003e" /* Deep purple background */,
            "--light-background": "#4a0072" /* Dark purple surface */,
            "--surface": "#2e003e" /* Deep purple surface */,
            "--primary-text": "#e1bee7" /* Light lavender primary text */,
            "--secondary-text": "#ce93d8" /* Medium lavender secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#6a1b9a" /* Dark lavender divider */,
            "--shadow": "rgba(46, 0, 62, 0.7)" /* Deep purple shadow */,
            "--primary": "#d500f9" /* Bright magenta primary color */,
            "--secondary": "#aa00ff" /* Bright violet secondary color */,
            "--tertiary": "#e040fb" /* Bright pink tertiary color */,
            "--quaternary": "#e91e63" /* Bright pink quaternary color */,
            "--warning": "#ff4081" /* Bright pink warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#29b6f6" /* Bright blue info color */,
            "--success": "#66bb6a" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(213, 0, 249, 0.7)" /* Bright magenta shadow */,
            "--group-card-hover": "#4a0072" /* Dark purple card hover color */,
            "--separator": "#6a1b9a" /* Dark lavender separator */,
            "--select-background-color":
                "#2e003e" /* Deep purple select background color */,
            "--select-text-color":
                "#e1bee7" /* Light lavender select text color */,
            "--select-focus-border-color":
                "#d500f9" /* Bright magenta focus border color */,
            "--select-focus-box-shadow":
                "rgba(213, 0, 249, 0.3)" /* Bright magenta focus shadow */,
        },

        sunsetPurpleTheme: {
            "--background": "#3e1a4d" /* Dark purple background */,
            "--light-background": "#562a6a" /* Medium dark purple surface */,
            "--surface": "#3e1a4d" /* Dark purple surface */,
            "--primary-text": "#ffb3ff" /* Light pink primary text */,
            "--secondary-text": "#d48fd4" /* Medium pink secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#7a478a" /* Dark pink divider */,
            "--shadow": "rgba(62, 26, 77, 0.7)" /* Dark purple shadow */,
            "--primary": "#ff33cc" /* Bright pink primary color */,
            "--secondary": "#ff66ff" /* Bright fuchsia secondary color */,
            "--tertiary": "#ff99ff" /* Light pink tertiary color */,
            "--quaternary": "#ff33ff" /* Bright magenta quaternary color */,
            "--warning": "#ffcc00" /* Bright orange warning color */,
            "--error": "#ff0033" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(255, 51, 204, 0.7)" /* Bright pink shadow */,
            "--group-card-hover":
                "#562a6a" /* Medium dark purple card hover color */,
            "--separator": "#7a478a" /* Dark pink separator */,
            "--select-background-color":
                "#3e1a4d" /* Dark purple select background color */,
            "--select-text-color": "#ffb3ff" /* Light pink select text color */,
            "--select-focus-border-color":
                "#ff33cc" /* Bright pink focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 51, 204, 0.3)" /* Bright pink focus shadow */,
        },

        darkBlueGreenTheme: {
            "--background": "#0d1b2a",
            "--light-background": "#1b263b",
            "--surface": "#415a77",
            "--primary-text": "#e0e1dd",
            "--secondary-text": "#778da9",
            "--dark-text": "#ffffff",
            "--divider": "#4f5d75",
            "--shadow": "rgba(0, 0, 0, 0.3)",
            "--primary": "#1f7a8c",
            "--secondary": "#ff9f1c",
            "--warning": "#e71d36",
            "--error": "#ff4040",
            "--info": "#4dabf7",
            "--success": "#2ec4b6",
            "--dropdown-box-shadow": "rgba(31, 122, 140, 0.5)",
            "--group-card-hover": "#1b263b",
            "--seperator": "#4f5d75",
            "--select-background-color": "#415a77",
            "--select-text-color": "#e0e1dd",
            "--select-focus-border-color": "#1f7a8c",
            "--select-focus-box-shadow": "rgba(31, 122, 140, 0.3)",
        },
        darkTealTheme: {
            "--background": "#0a3d62",
            "--light-background": "#1e5f74",
            "--surface": "#3c787e",
            "--primary-text": "#e0e1dd",
            "--secondary-text": "#778d8e",
            "--dark-text": "#ffffff",
            "--divider": "#4f5d75",
            "--shadow": "rgba(0, 0, 0, 0.3)",
            "--primary": "#26a69a",
            "--secondary": "#ff7043",
            "--warning": "#ffa000",
            "--error": "#ef5350",
            "--info": "#42a5f5",
            "--success": "#66bb6a",
            "--dropdown-box-shadow": "rgba(38, 166, 154, 0.5)",
            "--group-card-hover": "#1e5f74",
            "--seperator": "#4f5d75",
            "--select-background-color": "#3c787e",
            "--select-text-color": "#e0e1dd",
            "--select-focus-border-color": "#26a69a",
            "--select-focus-box-shadow": "rgba(38, 166, 154, 0.3)",
        },

        oceanAbyssTheme: {
            "--background": "#0d1b2a",
            "--light-background": "#1b263b",
            "--surface": "#4f6d7a",
            "--primary-text": "#e0e1dd",
            "--secondary-text": "#778da9",
            "--dark-text": "#ffffff",
            "--divider": "#415a77",
            "--shadow": "rgba(13, 27, 42, 0.7)",
            "--primary": "#4f6d7a", //Slate blue
            "--secondary": "#1c2541", //Dark navy
            "--warning": "#ffcc00",
            "--error": "#ff0033",
            "--info": "#33ccff",
            "--success": "#66ff66",
            "--dropdown-box-shadow": "rgba(79, 109, 122, 0.7)",
            "--group-card-hover": "#1b263b",
            "--seperator": "#415a77",
            "--select-background-color": "#4f6d7a",
            "--select-text-color": "#e0e1dd",
            "--select-focus-border-color": "#4f6d7a",
            "--select-focus-box-shadow": "rgba(79, 109, 122, 0.3)",
        },
        silverGrayTheme: {
            "--background": "#1f1f1f" /* Dark gray background */,
            "--light-background": "#2e2e2e" /* Dark gray surface */,
            "--surface": "#3c3c3c" /* Medium gray surface */,
            "--primary-text": "#e0e0e0" /* Light gray primary text */,
            "--secondary-text": "#b0b0b0" /* Medium gray secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#505050" /* Medium gray divider */,
            "--shadow": "rgba(31, 31, 31, 0.7)" /* Dark gray shadow */,
            "--primary": "#76c7c0" /* Bright turquoise primary color */,
            "--secondary": "#ffab00" /* Bright yellow secondary color */,
            "--warning": "#ffa726" /* Bright orange warning color */,
            "--error": "#ef5350" /* Bright red error color */,
            "--info": "#29b6f6" /* Bright blue info color */,
            "--success": "#66bb6a" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(118, 199, 192, 0.5)" /* Primary color shadow */,
            "--group-card-hover": "#2e2e2e" /* Dark gray card hover color */,
            "--separator": "#505050" /* Medium gray separator */,
            "--select-background-color":
                "#3c3c3c" /* Medium gray select background color */,
            "--select-text-color": "#e0e0e0" /* Light gray select text color */,
            "--select-focus-border-color":
                "#76c7c0" /* Primary color focus border */,
            "--select-focus-box-shadow":
                "rgba(118, 199, 192, 0.3)" /* Primary color focus shadow */,
        },
        midnightBlueTheme: {
            "--background": "#0a1a2a",
            "--light-background": "#1a2a3a",
            "--surface": "#2a3a4a",
            "--primary-text": "#d0e0f0",
            "--secondary-text": "#a0b0c0",
            "--dark-text": "#ffffff",
            "--divider": "#3a4a5a",
            "--shadow": "rgba(10, 26, 42, 0.7)",
            "--primary": "#1f7a8c",
            "--secondary": "#ff9f1c",
            "--warning": "#e71d36",
            "--error": "#ff4040",
            "--info": "#4dabf7",
            "--success": "#2ec4b6",
            "--dropdown-box-shadow": "rgba(31, 122, 140, 0.5)",
            "--group-card-hover": "#1a2a3a",
            "--separator": "#3a4a5a",
            "--select-background-color": "#2a3a4a",
            "--select-text-color": "#d0e0f0",
            "--select-focus-border-color": "#1f7a8c",
            "--select-focus-box-shadow": "rgba(31, 122, 140, 0.3)",
        },

        elegantGrayTheme: {
            "--background": "#2e2e2e" /* Dark gray background */,
            "--light-background": "#3e3e3e" /* Medium gray surface */,
            "--surface": "#4e4e4e" /* Light gray surface */,
            "--primary-text": "#e0e0e0" /* Light gray primary text */,
            "--secondary-text": "#bdbdbd" /* Light gray secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#666666" /* Dark gray divider */,
            "--shadow": "rgba(46, 46, 46, 0.7)" /* Dark gray shadow */,
            "--primary": "#a0a0a0" /* Medium gray primary color */,
            "--secondary": "#bdbdbd" /* Light gray secondary color */,
            "--warning": "#ffc107" /* Yellow warning color */,
            "--error": "#e57373" /* Light red error color */,
            "--info": "#64b5f6" /* Light blue info color */,
            "--success": "#81c784" /* Light green success color */,
            "--dropdown-box-shadow":
                "rgba(160, 160, 160, 0.7)" /* Medium gray shadow */,
            "--group-card-hover": "#3e3e3e" /* Medium gray card hover color */,
            "--separator": "#666666" /* Dark gray separator */,
            "--select-background-color":
                "#4e4e4e" /* Light gray select background color */,
            "--select-text-color": "#e0e0e0" /* Light gray select text color */,
            "--select-focus-border-color":
                "#a0a0a0" /* Medium gray focus border color */,
            "--select-focus-box-shadow":
                "rgba(160, 160, 160, 0.3)" /* Medium gray focus shadow */,
        },
        slateGrayTheme: {
            "--background": "#1c1c1c",
            "--light-background": "#2a2a2a",
            "--surface": "#3a3a3a",
            "--primary-text": "#d0d0d0",
            "--secondary-text": "#a0a0a0",
            "--dark-text": "#ffffff",
            "--divider": "#4a4a4a",
            "--shadow": "rgba(28, 28, 28, 0.7)",
            "--primary": "#5f5f5f",
            "--secondary": "#8d8d8d",
            "--warning": "#ffa726",
            "--error": "#d32f2f",
            "--info": "#42a5f5",
            "--success": "#66bb6a",
            "--dropdown-box-shadow": "rgba(95, 95, 95, 0.7)",
            "--group-card-hover": "#2a2a2a",
            "--separator": "#4a4a4a",
            "--select-background-color": "#3a3a3a",
            "--select-text-color": "#d0d0d0",
            "--select-focus-border-color": "#5f5f5f",
            "--select-focus-box-shadow": "rgba(95, 95, 95, 0.3)",
        },

        findingNemoTheme: {
            "--background": "#001f3f" /* Deep ocean blue background */,
            "--light-background": "#0074d9" /* Medium ocean blue surface */,
            "--surface": "#0074d9" /* Medium ocean blue surface */,
            "--primary-text": "#ffffff" /* White primary text */,
            "--secondary-text": "#bbdefb" /* Light blue secondary text */,
            "--dark-text": "#000000" /* Black text */,
            "--divider": "#39ace7" /* Light blue divider */,
            "--shadow": "rgba(0, 31, 63, 0.7)" /* Deep ocean blue shadow */,
            "--primary": "#ff851b" /* Bright orange primary color */,
            "--secondary": "#ffdc00" /* Bright yellow secondary color */,
            "--tertiary": "#ff4136" /* Bright red tertiary color */,
            "--quaternary": "#0074d9" /* Bright blue quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(255, 133, 27, 0.7)" /* Bright orange shadow */,
            "--group-card-hover":
                "#0074d9" /* Medium ocean blue card hover color */,
            "--separator": "#39ace7" /* Light blue separator */,
            "--select-background-color":
                "#001f3f" /* Deep ocean blue select background color */,
            "--select-text-color": "#ffffff" /* White select text color */,
            "--select-focus-border-color":
                "#ff851b" /* Bright orange focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 133, 27, 0.3)" /* Bright orange focus shadow */,
        },

        oceanBlueTheme: {
            "--background": "#0277bd" /* Ocean blue background */,
            "--light-background": "#58a5f0" /* Light ocean blue surface */,
            "--surface": "#0277bd" /* Ocean blue surface */,
            "--primary-text": "#ffffff" /* White primary text */,
            "--secondary-text": "#b3e5fc" /* Light blue secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#4fc3f7" /* Light blue divider */,
            "--shadow": "rgba(2, 119, 189, 0.5)" /* Ocean blue shadow */,
            "--primary": "#0277bd" /* Ocean blue primary color */,
            "--secondary": "#4fc3f7" /* Light blue secondary color */,
            "--warning": "#ffca28" /* Bright yellow warning color */,
            "--error": "#e53935" /* Bright red error color */,
            "--info": "#29b6f6" /* Bright blue info color */,
            "--success": "#66bb6a" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(2, 119, 189, 0.7)" /* Ocean blue shadow */,
            "--group-card-hover":
                "#58a5f0" /* Light ocean blue card hover color */,
            "--separator": "#4fc3f7" /* Light blue separator */,
            "--select-background-color":
                "#0277bd" /* Ocean blue select background color */,
            "--select-text-color": "#ffffff" /* White select text color */,
            "--select-focus-border-color":
                "#0277bd" /* Ocean blue focus border color */,
            "--select-focus-box-shadow":
                "rgba(2, 119, 189, 0.3)" /* Ocean blue focus shadow */,
        },

        skyBlueTheme: {
            "--background": "#0288d1" /* Sky blue background */,
            "--light-background": "#4fc3f7" /* Light sky blue surface */,
            "--surface": "#0288d1" /* Sky blue surface */,
            "--primary-text": "#ffffff" /* White primary text */,
            "--secondary-text": "#b3e5fc" /* Light blue secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#81d4fa" /* Light blue divider */,
            "--shadow": "rgba(2, 136, 209, 0.5)" /* Sky blue shadow */,
            "--primary": "#0288d1" /* Sky blue primary color */,
            "--secondary": "#81d4fa" /* Light blue secondary color */,
            "--warning": "#ffa726" /* Bright orange warning color */,
            "--error": "#e53935" /* Bright red error color */,
            "--info": "#29b6f6" /* Bright blue info color */,
            "--success": "#66bb6a" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(2, 136, 209, 0.7)" /* Sky blue shadow */,
            "--group-card-hover":
                "#4fc3f7" /* Light sky blue card hover color */,
            "--separator": "#81d4fa" /* Light blue separator */,
            "--select-background-color":
                "#0288d1" /* Sky blue select background color */,
            "--select-text-color": "#ffffff" /* White select text color */,
            "--select-focus-border-color":
                "#0288d1" /* Sky blue focus border color */,
            "--select-focus-box-shadow":
                "rgba(2, 136, 209, 0.3)" /* Sky blue focus shadow */,
        },

        interstellarTheme: {
            "--background": "#0b3d91" /* Deep space blue background */,
            "--light-background": "#1a5276" /* Medium space blue surface */,
            "--surface": "#0b3d91" /* Deep space blue surface */,
            "--primary-text": "#d4e6f1" /* Light space blue primary text */,
            "--secondary-text":
                "#aed6f1" /* Medium space blue secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#5dade2" /* Light blue divider */,
            "--shadow": "rgba(11, 61, 145, 0.7)" /* Deep space blue shadow */,
            "--primary": "#2874a6" /* Medium space blue primary color */,
            "--secondary": "#5499c7" /* Light blue secondary color */,
            "--tertiary": "#1f618d" /* Dark blue tertiary color */,
            "--quaternary": "#2980b9" /* Bright blue quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(40, 116, 166, 0.7)" /* Medium space blue shadow */,
            "--group-card-hover":
                "#1a5276" /* Medium space blue card hover color */,
            "--separator": "#5dade2" /* Light blue separator */,
            "--select-background-color":
                "#0b3d91" /* Deep space blue select background color */,
            "--select-text-color":
                "#d4e6f1" /* Light space blue select text color */,
            "--select-focus-border-color":
                "#2874a6" /* Medium space blue focus border color */,
            "--select-focus-box-shadow":
                "rgba(40, 116, 166, 0.3)" /* Medium space blue focus shadow */,
        },

        darkNavyTheme: {
            "--background": "#001f3f",
            "--light-background": "#002f5f",
            "--surface": "#004080",
            "--primary-text": "#f0f8ff",
            "--secondary-text": "#b0c4de",
            "--dark-text": "#ffffff",
            "--divider": "#5f9ea0",
            "--shadow": "rgba(0, 31, 63, 0.7)",
            "--primary": "#1e90ff",
            "--secondary": "#00ced1",
            "--warning": "#ffd700",
            "--error": "#ff4500",
            "--info": "#4682b4",
            "--success": "#32cd32",
            "--dropdown-box-shadow": "rgba(30, 144, 255, 0.7)",
            "--group-card-hover": "#002f5f",
            "--seperator": "#5f9ea0",
            "--select-background-color": "#004080",
            "--select-text-color": "#f0f8ff",
            "--select-focus-border-color": "#1e90ff",
            "--select-focus-box-shadow": "rgba(30, 144, 255, 0.3)",
        },

        twilightMeadowTheme: {
            "--background": "#003366" /* Dark blue background */,
            "--light-background": "#004080" /* Medium dark blue surface */,
            "--surface": "#003366" /* Dark blue surface */,
            "--primary-text": "#b3d9ff" /* Light blue primary text */,
            "--secondary-text": "#80bfff" /* Medium blue secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#0066cc" /* Medium blue divider */,
            "--shadow": "rgba(0, 51, 102, 0.7)" /* Dark blue shadow */,
            "--primary": "#3399ff" /* Bright blue primary color */,
            "--secondary": "#66ccff" /* Light blue secondary color */,
            "--tertiary": "#99ccff" /* Sky blue tertiary color */,
            "--quaternary": "#00ccff" /* Bright cyan quaternary color */,
            "--warning": "#ffcc00" /* Bright orange warning color */,
            "--error": "#ff0033" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(51, 153, 255, 0.7)" /* Bright blue shadow */,
            "--group-card-hover":
                "#004080" /* Medium dark blue card hover color */,
            "--separator": "#0066cc" /* Medium blue separator */,
            "--select-background-color":
                "#003366" /* Dark blue select background color */,
            "--select-text-color": "#b3d9ff" /* Light blue select text color */,
            "--select-focus-border-color":
                "#3399ff" /* Bright blue focus border color */,
            "--select-focus-box-shadow":
                "rgba(51, 153, 255, 0.3)" /* Bright blue focus shadow */,
        },

        avatarTheme: {
            "--background": "#001f3f" /* Deep navy blue background */,
            "--light-background": "#00264d" /* Dark blue surface */,
            "--surface": "#001f3f" /* Deep navy blue surface */,
            "--primary-text": "#00e5ff" /* Bright cyan primary text */,
            "--secondary-text": "#80deea" /* Light cyan secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#0077b6" /* Dark cyan divider */,
            "--shadow": "rgba(0, 31, 63, 0.7)" /* Deep navy blue shadow */,
            "--primary": "#00e5ff" /* Bright cyan primary color */,
            "--secondary": "#80deea" /* Light cyan secondary color */,
            "--tertiary": "#00ccff" /* Bright blue tertiary color */,
            "--quaternary": "#0077b6" /* Dark blue quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#ff0033" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(0, 229, 255, 0.7)" /* Bright cyan shadow */,
            "--group-card-hover": "#00264d" /* Dark blue card hover color */,
            "--separator": "#0077b6" /* Dark cyan separator */,
            "--select-background-color":
                "#001f3f" /* Deep navy blue select background color */,
            "--select-text-color":
                "#00e5ff" /* Bright cyan select text color */,
            "--select-focus-border-color":
                "#00e5ff" /* Bright cyan focus border color */,
            "--select-focus-box-shadow":
                "rgba(0, 229, 255, 0.3)" /* Bright cyan focus shadow */,
        },
        arcticFrostTheme: {
            "--background": "#001f3f" /* Deep navy blue background */,
            "--light-background": "#003366" /* Dark blue surface */,
            "--surface": "#001f3f" /* Deep navy blue surface */,
            "--primary-text": "#e0f7fa" /* Light cyan primary text */,
            "--secondary-text": "#80deea" /* Medium cyan secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#0077b6" /* Dark cyan divider */,
            "--shadow": "rgba(0, 31, 63, 0.7)" /* Deep navy blue shadow */,
            "--primary": "#00bcd4" /* Bright cyan primary color */,
            "--secondary": "#1de9b6" /* Bright teal secondary color */,
            "--tertiary": "#00e5ff" /* Bright light blue tertiary color */,
            "--quaternary": "#76ff03" /* Bright green quaternary color */,
            "--warning": "#ffcc00" /* Bright orange warning color */,
            "--error": "#ff0033" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(0, 188, 212, 0.7)" /* Bright cyan shadow */,
            "--group-card-hover": "#003366" /* Dark blue card hover color */,
            "--separator": "#0077b6" /* Dark cyan separator */,
            "--select-background-color":
                "#001f3f" /* Deep navy blue select background color */,
            "--select-text-color": "#e0f7fa" /* Light cyan select text color */,
            "--select-focus-border-color":
                "#00bcd4" /* Bright cyan focus border color */,
            "--select-focus-box-shadow":
                "rgba(0, 188, 212, 0.3)" /* Bright cyan focus shadow */,
        },
        frozenTheme: {
            "--background": "#001f3f" /* Deep navy blue background */,
            "--light-background": "#002f5f" /* Medium dark blue surface */,
            "--surface": "#001f3f" /* Deep navy blue surface */,
            "--primary-text": "#e0f7fa" /* Light cyan primary text */,
            "--secondary-text": "#80deea" /* Medium cyan secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#00acc1" /* Medium cyan divider */,
            "--shadow": "rgba(0, 31, 63, 0.7)" /* Deep navy blue shadow */,
            "--primary": "#00bcd4" /* Bright cyan primary color */,
            "--secondary": "#1de9b6" /* Bright teal secondary color */,
            "--tertiary": "#00e5ff" /* Bright light blue tertiary color */,
            "--quaternary": "#76ff03" /* Bright green quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#ff0033" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(0, 188, 212, 0.7)" /* Bright cyan shadow */,
            "--group-card-hover":
                "#002f5f" /* Medium dark blue card hover color */,
            "--separator": "#00acc1" /* Medium cyan separator */,
            "--select-background-color":
                "#001f3f" /* Deep navy blue select background color */,
            "--select-text-color": "#e0f7fa" /* Light cyan select text color */,
            "--select-focus-border-color":
                "#00bcd4" /* Bright cyan focus border color */,
            "--select-focus-box-shadow":
                "rgba(0, 188, 212, 0.3)" /* Bright cyan focus shadow */,
        },
        titanicTheme: {
            "--background": "#001f3f" /* Deep navy blue background */,
            "--light-background": "#003366" /* Medium navy blue surface */,
            "--surface": "#001f3f" /* Deep navy blue surface */,
            "--primary-text": "#d4e6f1" /* Light blue primary text */,
            "--secondary-text": "#aed6f1" /* Medium blue secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#5dade2" /* Light blue divider */,
            "--shadow": "rgba(0, 31, 63, 0.7)" /* Deep navy blue shadow */,
            "--primary": "#2980b9" /* Bright blue primary color */,
            "--secondary": "#1f618d" /* Dark blue secondary color */,
            "--tertiary": "#3498db" /* Medium blue tertiary color */,
            "--quaternary": "#1a5276" /* Medium dark blue quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(41, 128, 185, 0.7)" /* Bright blue shadow */,
            "--group-card-hover":
                "#003366" /* Medium navy blue card hover color */,
            "--separator": "#5dade2" /* Light blue separator */,
            "--select-background-color":
                "#001f3f" /* Deep navy blue select background color */,
            "--select-text-color": "#d4e6f1" /* Light blue select text color */,
            "--select-focus-border-color":
                "#2980b9" /* Bright blue focus border color */,
            "--select-focus-box-shadow":
                "rgba(41, 128, 185, 0.3)" /* Bright blue focus shadow */,
        },

        inceptionTheme: {
            "--background": "#2c3e50" /* Deep navy blue background */,
            "--light-background": "#34495e" /* Dark navy blue surface */,
            "--surface": "#2c3e50" /* Deep navy blue surface */,
            "--primary-text": "#ecf0f1" /* Light gray primary text */,
            "--secondary-text": "#95a5a6" /* Medium gray secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#7f8c8d" /* Medium gray divider */,
            "--shadow": "rgba(44, 62, 80, 0.7)" /* Deep navy blue shadow */,
            "--primary": "#e74c3c" /* Bright red primary color */,
            "--secondary": "#f39c12" /* Bright orange secondary color */,
            "--tertiary": "#f1c40f" /* Bright yellow tertiary color */,
            "--quaternary": "#16a085" /* Bright teal quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#ff0033" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(231, 76, 60, 0.7)" /* Bright red shadow */,
            "--group-card-hover":
                "#34495e" /* Dark navy blue card hover color */,
            "--separator": "#7f8c8d" /* Medium gray separator */,
            "--select-background-color":
                "#2c3e50" /* Deep navy blue select background color */,
            "--select-text-color": "#ecf0f1" /* Light gray select text color */,
            "--select-focus-border-color":
                "#e74c3c" /* Bright red focus border color */,
            "--select-focus-box-shadow":
                "rgba(231, 76, 60, 0.3)" /* Bright red focus shadow */,
        },

        godfatherTheme: {
            "--background": "#2c3e50" /* Deep navy blue background */,
            "--light-background": "#34495e" /* Medium dark navy blue surface */,
            "--surface": "#2c3e50" /* Deep navy blue surface */,
            "--primary-text": "#ecf0f1" /* Light gray primary text */,
            "--secondary-text": "#95a5a6" /* Medium gray secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#7f8c8d" /* Medium gray divider */,
            "--shadow": "rgba(44, 62, 80, 0.7)" /* Deep navy blue shadow */,
            "--primary": "#e74c3c" /* Bright red primary color */,
            "--secondary": "#c0392b" /* Dark red secondary color */,
            "--tertiary": "#e67e22" /* Bright orange tertiary color */,
            "--quaternary": "#d35400" /* Dark orange quaternary color */,
            "--warning": "#f39c12" /* Bright yellow warning color */,
            "--error": "#e74c3c" /* Bright red error color */,
            "--info": "#3498db" /* Bright blue info color */,
            "--success": "#2ecc71" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(231, 76, 60, 0.7)" /* Bright red shadow */,
            "--group-card-hover":
                "#34495e" /* Medium dark navy blue card hover color */,
            "--separator": "#7f8c8d" /* Medium gray separator */,
            "--select-background-color":
                "#2c3e50" /* Deep navy blue select background color */,
            "--select-text-color": "#ecf0f1" /* Light gray select text color */,
            "--select-focus-border-color":
                "#e74c3c" /* Bright red focus border color */,
            "--select-focus-box-shadow":
                "rgba(231, 76, 60, 0.3)" /* Bright red focus shadow */,
        },
        piratesTheme: {
            "--background": "#3e2723" /* Deep brown background */,
            "--light-background": "#5d4037" /* Medium dark brown surface */,
            "--surface": "#3e2723" /* Deep brown surface */,
            "--primary-text": "#ffffff" /* White primary text */,
            "--secondary-text": "#d7ccc8" /* Light brown secondary text */,
            "--dark-text": "#000000" /* Black text */,
            "--divider": "#8d6e63" /* Medium brown divider */,
            "--shadow": "rgba(62, 39, 35, 0.7)" /* Deep brown shadow */,
            "--primary": "#ffcc00" /* Bright yellow primary color */,
            "--secondary": "#ffd54f" /* Light yellow secondary color */,
            "--tertiary": "#ffeb3b" /* Bright yellow tertiary color */,
            "--quaternary": "#f57c00" /* Bright orange quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(255, 204, 0, 0.7)" /* Bright yellow shadow */,
            "--group-card-hover":
                "#5d4037" /* Medium dark brown card hover color */,
            "--separator": "#8d6e63" /* Medium brown separator */,
            "--select-background-color":
                "#3e2723" /* Deep brown select background color */,
            "--select-text-color": "#ffffff" /* White select text color */,
            "--select-focus-border-color":
                "#ffcc00" /* Bright yellow focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 204, 0, 0.3)" /* Bright yellow focus shadow */,
        },

        royalGoldTheme: {
            "--background": "#333333" /* Dark gray background */,
            "--light-background": "#4f4f4f" /* Medium dark gray surface */,
            "--surface": "#333333" /* Dark gray surface */,
            "--primary-text": "#ffd700" /* Gold primary text */,
            "--secondary-text": "#ffec8b" /* Light gold secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#b8860b" /* Dark gold divider */,
            "--shadow": "rgba(51, 51, 51, 0.7)" /* Dark gray shadow */,
            "--primary": "#ffd700" /* Gold primary color */,
            "--secondary": "#ffec8b" /* Light gold secondary color */,
            "--tertiary": "#ffc107" /* Amber tertiary color */,
            "--quaternary": "#ff9800" /* Bright orange quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#ff0033" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow": "rgba(255, 215, 0, 0.7)" /* Gold shadow */,
            "--group-card-hover":
                "#4f4f4f" /* Medium dark gray card hover color */,
            "--separator": "#b8860b" /* Dark gold separator */,
            "--select-background-color":
                "#333333" /* Dark gray select background color */,
            "--select-text-color": "#ffd700" /* Gold select text color */,
            "--select-focus-border-color":
                "#ffd700" /* Gold focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 215, 0, 0.3)" /* Gold focus shadow */,
        },

        neonGreenTheme: {
            "--background": "#0d0d0d",
            "--light-background": "#1a1a1a",
            "--surface": "#262626",
            "--primary-text": "#ffffff",
            "--secondary-text": "#a1a1a1",
            "--dark-text": "#e0e0e0",
            "--divider": "#333333",
            "--shadow": "rgba(0, 0, 0, 0.7)",
            "--primary": "#00ff7f",
            "--secondary": "#ff00ff",
            "--warning": "#ffea00",
            "--error": "#ff1744",
            "--info": "#00e5ff",
            "--success": "#76ff03",
            "--dropdown-box-shadow": "rgba(0, 255, 127, 0.7)",
            "--group-card-hover": "#1f1f1f",
            "--seperator": "#404040",
            "--select-background-color": "#1a1a1a",
            "--select-text-color": "#ffffff",
            "--select-focus-border-color": "#00ff7f",
            "--select-focus-box-shadow": "rgba(0, 255, 127, 0.3)",
        },
        solidBlackTheme: {
            "--background": "#000000",
            "--light-background": "#1a1a1a",
            "--surface": "#2e2e2e",
            "--primary-text": "#e0e0e0",
            "--secondary-text": "#bdbdbd",
            "--dark-text": "#ffffff",
            "--divider": "#4f4f4f",
            "--shadow": "rgba(0, 0, 0, 0.7)",
            "--primary": "#6200ea",
            "--secondary": "#03dac6",
            "--warning": "#ffd600",
            "--error": "#cf6679",
            "--info": "#2196f3",
            "--success": "#4caf50",
            "--dropdown-box-shadow": "rgba(98, 0, 234, 0.7)",
            "--group-card-hover": "#1a1a1a",
            "--seperator": "#4f4f4f",
            "--select-background-color": "#2e2e2e",
            "--select-text-color": "#e0e0e0",
            "--select-focus-border-color": "#6200ea",
            "--select-focus-box-shadow": "rgba(98, 0, 234, 0.3)",
        },

        darkGrayTheme: {
            "--background": "#1a1a1a",
            "--light-background": "#2e2e2e",
            "--surface": "#404040",
            "--primary-text": "#d0d0d0",
            "--secondary-text": "#a0a0a0",
            "--dark-text": "#ffffff",
            "--divider": "#555555",
            "--shadow": "rgba(26, 26, 26, 0.7)",
            "--primary": "#8d8d8d",
            "--secondary": "#b0b0b0",
            "--warning": "#ffa000",
            "--error": "#e64a19",
            "--info": "#1976d2",
            "--success": "#388e3c",
            "--dropdown-box-shadow": "rgba(141, 141, 141, 0.7)",
            "--group-card-hover": "#2e2e2e",
            "--seperator": "#555555",
            "--select-background-color": "#404040",
            "--select-text-color": "#d0d0d0",
            "--select-focus-border-color": "#8d8d8d",
            "--select-focus-box-shadow": "rgba(141, 141, 141, 0.3)",
        },
        darkAnthraciteTheme: {
            "--background": "#181818",
            "--light-background": "#282828",
            "--surface": "#383838",
            "--primary-text": "#d3d3d3",
            "--secondary-text": "#a9a9a9",
            "--dark-text": "#ffffff",
            "--divider": "#505050",
            "--shadow": "rgba(24, 24, 24, 0.7)",
            "--primary": "#5e35b1",
            "--secondary": "#ff7043",
            "--warning": "#ffa000",
            "--error": "#d32f2f",
            "--info": "#1976d2",
            "--success": "#388e3c",
            "--dropdown-box-shadow": "rgba(94, 53, 177, 0.7)",
            "--group-card-hover": "#282828",
            "--seperator": "#505050",
            "--select-background-color": "#383838",
            "--select-text-color": "#d3d3d3",
            "--select-focus-border-color": "#5e35b1",
            "--select-focus-box-shadow": "rgba(94, 53, 177, 0.3)",
        },
        darkGrayNeonTheme: {
            "--background": "#2c2c2c",
            "--light-background": "#3d3d3d",
            "--surface": "#4a4a4a",
            "--primary-text": "#e0e0e0",
            "--secondary-text": "#b0b0b0",
            "--dark-text": "#ffffff",
            "--divider": "#616161",
            "--shadow": "rgba(0, 0, 0, 0.7)",
            "--primary": "#8e24aa",
            "--secondary": "#d81b60",
            "--warning": "#ffa726",
            "--error": "#e53935",
            "--info": "#29b6f6",
            "--success": "#66bb6a",
            "--dropdown-box-shadow": "rgba(142, 36, 170, 0.7)",
            "--group-card-hover": "#424242",
            "--seperator": "#757575",
            "--select-background-color": "#3d3d3d",
            "--select-text-color": "#e0e0e0",
            "--select-focus-border-color": "#8e24aa",
            "--select-focus-box-shadow": "rgba(142, 36, 170, 0.3)",
        },
        graphiteGrayTheme: {
            "--background": "#121212",
            "--light-background": "#1c1c1c",
            "--surface": "#333333",
            "--primary-text": "#e0e0e0",
            "--secondary-text": "#bdbdbd",
            "--dark-text": "#ffffff",
            "--divider": "#424242",
            "--shadow": "rgba(18, 18, 18, 0.7)",
            "--primary": "#3949ab",
            "--secondary": "#f50057",
            "--warning": "#ffab00",
            "--error": "#d32f2f",
            "--info": "#1976d2",
            "--success": "#388e3c",
            "--dropdown-box-shadow": "rgba(57, 73, 171, 0.7)",
            "--group-card-hover": "#1c1c1c",
            "--seperator": "#424242",
            "--select-background-color": "#333333",
            "--select-text-color": "#e0e0e0",
            "--select-focus-border-color": "#3949ab",
            "--select-focus-box-shadow": "rgba(57, 73, 171, 0.3)",
        },
        deepPurpleTheme: {
            "--background": "#1c0b19",
            "--light-background": "#2e1b29",
            "--surface": "#4a3a4f",
            "--primary-text": "#e0dfe5",
            "--secondary-text": "#bdb8c2",
            "--dark-text": "#ffffff",
            "--divider": "#6c5a7e",
            "--shadow": "rgba(28, 11, 25, 0.7)",
            "--primary": "#8e24aa",
            "--secondary": "#ba68c8",
            "--warning": "#ffab00",
            "--error": "#e53935",
            "--info": "#29b6f6",
            "--success": "#66bb6a",
            "--dropdown-box-shadow": "rgba(142, 36, 170, 0.7)",
            "--group-card-hover": "#2e1b29",
            "--seperator": "#6c5a7e",
            "--select-background-color": "#4a3a4f",
            "--select-text-color": "#e0dfe5",
            "--select-focus-border-color": "#8e24aa",
            "--select-focus-box-shadow": "rgba(142, 36, 170, 0.3)",
        },
        pinkFuchsiaTheme: {
            "--background": "#1a1a1a",
            "--light-background": "#2e2e2e",
            "--surface": "#3e3e3e",
            "--primary-text": "#e0e0e0",
            "--secondary-text": "#ff00ff",
            "--dark-text": "#ffffff",
            "--divider": "#ff69b4",
            "--shadow": "rgba(26, 26, 26, 0.7)",
            "--primary": "#ff00ff",
            "--secondary": "#ff69b4",
            "--warning": "#ffb74d",
            "--error": "#ff1744",
            "--info": "#1e90ff",
            "--success": "#32cd32",
            "--dropdown-box-shadow": "rgba(255, 0, 255, 0.7)",
            "--group-card-hover": "#2e2e2e",
            "--seperator": "#ff69b4",
            "--select-background-color": "#2e2e2e",
            "--select-text-color": "#ff00ff",
            "--select-focus-border-color": "#ff00ff",
            "--select-focus-box-shadow": "rgba(255, 0, 255, 0.3)",
        },
        darkBlackTheme: {
            "--background": "#0a0a0a",
            "--light-background": "#1c1c1c",
            "--surface": "#2e2e2e",
            "--primary-text": "#f5f5f5",
            "--secondary-text": "#bdbdbd",
            "--dark-text": "#ffffff",
            "--divider": "#4f4f4f",
            "--shadow": "rgba(0, 0, 0, 0.7)",
            "--primary": "#bb86fc",
            "--secondary": "#03dac6",
            "--warning": "#ffd600",
            "--error": "#cf6679",
            "--info": "#2196f3",
            "--success": "#4caf50",
            "--dropdown-box-shadow": "rgba(187, 134, 252, 0.7)",
            "--group-card-hover": "#1c1c1c",
            "--seperator": "#4f4f4f",
            "--select-background-color": "#2e2e2e",
            "--select-text-color": "#f5f5f5",
            "--select-focus-border-color": "#bb86fc",
            "--select-focus-box-shadow": "rgba(187, 134, 252, 0.3)",
        },

        macosDarkTheme: {
            "--background": "#1c1c1e" /* Very dark gray background */,
            "--light-background": "#2c2c2e" /* Dark gray surface */,
            "--surface": "#2c2c2e" /* Dark gray surface */,
            "--primary-text": "#f5f5f5" /* Light gray primary text */,
            "--secondary-text": "#a1a1a1" /* Medium gray secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#48484a" /* Medium dark gray divider */,
            "--shadow": "rgba(0, 0, 0, 0.5)" /* Dark shadow */,
            "--primary": "#0a84ff" /* Bright blue primary color */,
            "--secondary": "#5e5ce6" /* Purple secondary color */,
            "--tertiary": "#ff9f0a" /* Orange tertiary color */,
            "--quaternary": "#ff453a" /* Red quaternary color */,
            "--warning": "#ffd60a" /* Bright yellow warning color */,
            "--error": "#ff453a" /* Red error color */,
            "--info": "#64d2ff" /* Cyan info color */,
            "--success": "#30d158" /* Green success color */,
            "--dropdown-box-shadow":
                "rgba(10, 132, 255, 0.7)" /* Bright blue shadow */,
            "--group-card-hover": "#3a3a3c" /* Dark gray card hover color */,
            "--separator": "#48484a" /* Medium dark gray separator */,
            "--select-background-color":
                "#2c2c2e" /* Dark gray select background color */,
            "--select-text-color": "#f5f5f5" /* Light gray select text color */,
            "--select-focus-border-color":
                "#0a84ff" /* Bright blue focus border color */,
            "--select-focus-box-shadow":
                "rgba(10, 132, 255, 0.3)" /* Bright blue focus shadow */,
        },
        solarEclipseTheme: {
            "--background": "#2c3e50" /* Deep navy blue background */,
            "--light-background": "#34495e" /* Dark navy blue surface */,
            "--surface": "#2c3e50" /* Deep navy blue surface */,
            "--primary-text": "#ecf0f1" /* Light gray primary text */,
            "--secondary-text": "#95a5a6" /* Medium gray secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#7f8c8d" /* Medium gray divider */,
            "--shadow": "rgba(44, 62, 80, 0.7)" /* Deep navy blue shadow */,
            "--primary": "#e74c3c" /* Bright red primary color */,
            "--secondary": "#f39c12" /* Bright orange secondary color */,
            "--tertiary": "#f1c40f" /* Bright yellow tertiary color */,
            "--quaternary": "#16a085" /* Bright teal quaternary color */,
            "--warning": "#ffcc00" /* Bright orange warning color */,
            "--error": "#ff0033" /* Bright red error color */,
            "--info": "#3498db" /* Bright blue info color */,
            "--success": "#2ecc71" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(231, 76, 60, 0.7)" /* Bright red shadow */,
            "--group-card-hover":
                "#34495e" /* Dark navy blue card hover color */,
            "--separator": "#7f8c8d" /* Medium gray separator */,
            "--select-background-color":
                "#2c3e50" /* Deep navy blue select background color */,
            "--select-text-color": "#ecf0f1" /* Light gray select text color */,
            "--select-focus-border-color":
                "#e74c3c" /* Bright red focus border color */,
            "--select-focus-box-shadow":
                "rgba(231, 76, 60, 0.3)" /* Bright red focus shadow */,
        },
        ubuntuDarkTheme: {
            "--background": "#2e3436" /* Dark gray background */,
            "--light-background": "#3c3c3c" /* Medium dark gray surface */,
            "--surface": "#3c3c3c" /* Medium dark gray surface */,
            "--primary-text": "#ffffff" /* White primary text */,
            "--secondary-text": "#a3a3a3" /* Medium gray secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#484848" /* Dark gray divider */,
            "--shadow": "rgba(0, 0, 0, 0.5)" /* Dark shadow */,
            "--primary": "#e95420" /* Bright orange primary color */,
            "--secondary": "#77216f" /* Purple secondary color */,
            "--tertiary": "#5e2750" /* Dark purple tertiary color */,
            "--quaternary": "#ffffff" /* White quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#ff3b30" /* Red error color */,
            "--info": "#5ac8fa" /* Cyan info color */,
            "--success": "#4cd964" /* Green success color */,
            "--dropdown-box-shadow":
                "rgba(233, 84, 32, 0.7)" /* Bright orange shadow */,
            "--group-card-hover": "#484848" /* Dark gray card hover color */,
            "--separator": "#484848" /* Dark gray separator */,
            "--select-background-color":
                "#3c3c3c" /* Medium dark gray select background color */,
            "--select-text-color": "#ffffff" /* White select text color */,
            "--select-focus-border-color":
                "#e95420" /* Bright orange focus border color */,
            "--select-focus-box-shadow":
                "rgba(233, 84, 32, 0.3)" /* Bright orange focus shadow */,
        },
        fedoraDarkTheme: {
            "--background": "#1c1c1e" /* Very dark gray background */,
            "--light-background": "#2c2c2e" /* Dark gray surface */,
            "--surface": "#2c2c2e" /* Dark gray surface */,
            "--primary-text": "#f5f5f5" /* Light gray primary text */,
            "--secondary-text": "#a1a1a1" /* Medium gray secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#48484a" /* Medium dark gray divider */,
            "--shadow": "rgba(0, 0, 0, 0.5)" /* Dark shadow */,
            "--primary": "#294172" /* Bright blue primary color */,
            "--secondary": "#0056a3" /* Dark blue secondary color */,
            "--tertiary": "#003366" /* Dark blue tertiary color */,
            "--quaternary": "#ffffff" /* White quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#ff3b30" /* Red error color */,
            "--info": "#5ac8fa" /* Cyan info color */,
            "--success": "#4cd964" /* Green success color */,
            "--dropdown-box-shadow":
                "rgba(41, 65, 114, 0.7)" /* Bright blue shadow */,
            "--group-card-hover":
                "#48484a" /* Medium dark gray card hover color */,
            "--separator": "#48484a" /* Medium dark gray separator */,
            "--select-background-color":
                "#2c2c2e" /* Dark gray select background color */,
            "--select-text-color": "#f5f5f5" /* Light gray select text color */,
            "--select-focus-border-color":
                "#294172" /* Bright blue focus border color */,
            "--select-focus-box-shadow":
                "rgba(41, 65, 114, 0.3)" /* Bright blue focus shadow */,
        },
        openSuseDarkTheme: {
            "--background": "#1c1c1c" /* Dark gray background */,
            "--light-background": "#2c2c2c" /* Medium dark gray surface */,
            "--surface": "#2c2c2c" /* Medium dark gray surface */,
            "--primary-text": "#f5f5f5" /* Light gray primary text */,
            "--secondary-text": "#a3a3a3" /* Medium gray secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#3e3e3e" /* Dark gray divider */,
            "--shadow": "rgba(0, 0, 0, 0.5)" /* Dark shadow */,
            "--primary": "#73ba25" /* Bright green primary color */,
            "--secondary": "#8bc34a" /* Light green secondary color */,
            "--tertiary": "#558b2f" /* Dark green tertiary color */,
            "--quaternary": "#ffffff" /* White quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#ff3b30" /* Red error color */,
            "--info": "#5ac8fa" /* Cyan info color */,
            "--success": "#4cd964" /* Green success color */,
            "--dropdown-box-shadow":
                "rgba(115, 186, 37, 0.7)" /* Bright green shadow */,
            "--group-card-hover": "#3e3e3e" /* Dark gray card hover color */,
            "--separator": "#3e3e3e" /* Dark gray separator */,
            "--select-background-color":
                "#2c2c2c" /* Medium dark gray select background color */,
            "--select-text-color": "#f5f5f5" /* Light gray select text color */,
            "--select-focus-border-color":
                "#73ba25" /* Bright green focus border color */,
            "--select-focus-box-shadow":
                "rgba(115, 186, 37, 0.3)" /* Bright green focus shadow */,
        },
        darkBlueTheme: {
            "--background": "#0b0c10",
            "--light-background": "#1f2833",
            "--surface": "#2c3e50",
            "--primary-text": "#c5c6c7",
            "--secondary-text": "#66fcf1",
            "--dark-text": "#ffffff",
            "--divider": "#45a29e",
            "--shadow": "rgba(11, 12, 16, 0.7)",
            "--primary": "#66fcf1",
            "--secondary": "#45a29e",
            "--warning": "#f39c12",
            "--error": "#e74c3c",
            "--info": "#3498db",
            "--success": "#2ecc71",
            "--dropdown-box-shadow": "rgba(102, 252, 241, 0.7)",
            "--group-card-hover": "#1f2833",
            "--seperator": "#34495e",
            "--select-background-color": "#1f2833",
            "--select-text-color": "#c5c6c7",
            "--select-focus-border-color": "#66fcf1",
            "--select-focus-box-shadow": "rgba(102, 252, 241, 0.3)",
        },
        darkTheme: {
            "--background": "#1a1a1a",
            "--light-background": "#2e2e2e",
            "--surface": "#333333",
            "--primary-text": "#e0e0e0",
            "--secondary-text": "#b0b0b0",
            "--dark-text": "#ffffff",
            "--divider": "#555555",
            "--shadow": "rgba(0, 0, 0, 0.5)",
            "--primary": "#3a6ea5",
            "--secondary": "#9eb3c2",
            "--warning": "#e9c46a",
            "--error": "#e76f51",
            "--info": "#64a3f7",
            "--success": "#81c784",
            "--dropdown-box-shadow": "rgba(58, 110, 165, 0.7)",
            "--group-card-hover": "#404040",
            "--seperator": "#666666",
            "--select-background-color": "#3b3b3b",
            "--select-text-color": "#d1d5db",
            "--select-focus-border-color": "#2563eb",
            "--select-focus-box-shadow": "rgba(37, 99, 235, 0.5)",
        },
        windows11DarkTheme: {
            "--background": "#1c1c1c" /* Dark gray background */,
            "--light-background": "#2c2c2c" /* Medium dark gray surface */,
            "--surface": "#2c2c2c" /* Medium dark gray surface */,
            "--primary-text": "#f5f5f5" /* Light gray primary text */,
            "--secondary-text": "#a3a3a3" /* Medium gray secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#3e3e3e" /* Dark gray divider */,
            "--shadow": "rgba(0, 0, 0, 0.5)" /* Dark shadow */,
            "--primary": "#0078d4" /* Bright blue primary color */,
            "--secondary": "#005a9e" /* Medium blue secondary color */,
            "--tertiary": "#003a78" /* Dark blue tertiary color */,
            "--quaternary": "#ffffff" /* White quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#d13438" /* Red error color */,
            "--info": "#5ac8fa" /* Cyan info color */,
            "--success": "#107c10" /* Green success color */,
            "--dropdown-box-shadow":
                "rgba(0, 120, 212, 0.7)" /* Bright blue shadow */,
            "--group-card-hover": "#3e3e3e" /* Dark gray card hover color */,
            "--separator": "#3e3e3e" /* Dark gray separator */,
            "--select-background-color":
                "#2c2c2c" /* Medium dark gray select background color */,
            "--select-text-color": "#f5f5f5" /* Light gray select text color */,
            "--select-focus-border-color":
                "#0078d4" /* Bright blue focus border color */,
            "--select-focus-box-shadow":
                "rgba(0, 120, 212, 0.3)" /* Bright blue focus shadow */,
        },
        darkTurquoiseTheme: {
            "--background": "#121212",
            "--light-background": "#1e1e1e",
            "--surface": "#2c2c2c",
            "--primary-text": "#e0e0e0",
            "--secondary-text": "#bdbdbd",
            "--dark-text": "#ffffff",
            "--divider": "#484848",
            "--shadow": "rgba(0, 0, 0, 0.7)",
            "--primary": "#00bcd4",
            "--secondary": "#ff4081",
            "--tertiary": "#ffea00",
            "--quaternary": "#76ff03",
            "--warning": "#ffab00",
            "--error": "#ff5252",
            "--info": "#40c4ff",
            "--success": "#69f0ae",
            "--dropdown-box-shadow": "rgba(0, 188, 212, 0.7)",
            "--group-card-hover": "#1e1e1e",
            "--seperator": "#484848",
            "--select-background-color": "#2c2c2c",
            "--select-text-color": "#e0e0e0",
            "--select-focus-border-color": "#00bcd4",
            "--select-focus-box-shadow": "rgba(0, 188, 212, 0.3)",
        },
        guardiansGalaxyTheme: {
            "--background": "#1b1b2f" /* Deep navy blue background */,
            "--light-background": "#1f1f3d" /* Dark navy blue surface */,
            "--surface": "#1b1b2f" /* Deep navy blue surface */,
            "--primary-text": "#e0e1dd" /* Light gray primary text */,
            "--secondary-text": "#778da9" /* Medium gray secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#415a77" /* Medium blue divider */,
            "--shadow": "rgba(27, 27, 47, 0.7)" /* Deep navy blue shadow */,
            "--primary": "#ff6f61" /* Bright coral primary color */,
            "--secondary": "#ffcccb" /* Light pink secondary color */,
            "--tertiary": "#ff4081" /* Bright pink tertiary color */,
            "--quaternary": "#ff1744" /* Bright red quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(255, 111, 97, 0.7)" /* Bright coral shadow */,
            "--group-card-hover":
                "#1f1f3d" /* Dark navy blue card hover color */,
            "--separator": "#415a77" /* Medium blue separator */,
            "--select-background-color":
                "#1b1b2f" /* Deep navy blue select background color */,
            "--select-text-color": "#e0e1dd" /* Light gray select text color */,
            "--select-focus-border-color":
                "#ff6f61" /* Bright coral focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 111, 97, 0.3)" /* Bright coral focus shadow */,
        },
        rainbowTheme: {
            "--background": "#000000",
            "--light-background": "#1a1a1a",
            "--surface": "#262626",
            "--primary-text": "#ffffff",
            "--secondary-text": "#a1a1a1",
            "--dark-text": "#e0e0e0",
            "--divider": "#333333",
            "--shadow": "rgba(0, 0, 0, 0.7)",
            "--primary": "#ff0000",
            "--secondary": "#ff7f00",
            "--tertiary": "#ffff00",
            "--quaternary": "#00ff00",
            "--quinary": "#0000ff",
            "--senary": "#4b0082",
            "--septenary": "#8b00ff",
            "--warning": "#ffa726",
            "--error": "#ff1744",
            "--info": "#00e5ff",
            "--success": "#76ff03",
            "--dropdown-box-shadow": "rgba(255, 0, 0, 0.7)",
            "--group-card-hover": "#1f1f1f",
            "--seperator": "#404040",
            "--select-background-color": "#1a1a1a",
            "--select-text-color": "#ffffff",
            "--select-focus-border-color": "#ff0000",
            "--select-focus-box-shadow": "rgba(255, 0, 0, 0.3)",
        },
        blackPantherTheme: {
            "--background": "#0d0d0d" /* Dark black background */,
            "--light-background": "#1a1a1a" /* Very dark gray surface */,
            "--surface": "#0d0d0d" /* Dark black surface */,
            "--primary-text": "#b3b3b3" /* Light gray primary text */,
            "--secondary-text": "#808080" /* Medium gray secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#333333" /* Dark gray divider */,
            "--shadow": "rgba(13, 13, 13, 0.7)" /* Dark black shadow */,
            "--primary": "#9c27b0" /* Royal purple primary color */,
            "--secondary": "#673ab7" /* Deep purple secondary color */,
            "--tertiary": "#3f51b5" /* Indigo tertiary color */,
            "--quaternary": "#2196f3" /* Blue quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#00bcd4" /* Bright cyan info color */,
            "--success": "#4caf50" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(156, 39, 176, 0.7)" /* Royal purple shadow */,
            "--group-card-hover":
                "#1a1a1a" /* Very dark gray card hover color */,
            "--separator": "#333333" /* Dark gray separator */,
            "--select-background-color":
                "#0d0d0d" /* Dark black select background color */,
            "--select-text-color": "#b3b3b3" /* Light gray select text color */,
            "--select-focus-border-color":
                "#9c27b0" /* Royal purple focus border color */,
            "--select-focus-box-shadow":
                "rgba(156, 39, 176, 0.3)" /* Royal purple focus shadow */,
        },
        nebulaGlowTheme: {
            "--background": "#1c1c2e" /* Deep space blue background */,
            "--light-background": "#26264c" /* Dark blue surface */,
            "--surface": "#1c1c2e" /* Deep space blue surface */,
            "--primary-text": "#e0e0e0" /* Light gray primary text */,
            "--secondary-text": "#b0b0b0" /* Medium gray secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#3e3e5e" /* Dark blue divider */,
            "--shadow": "rgba(28, 28, 46, 0.7)" /* Deep space blue shadow */,
            "--primary": "#9c27b0" /* Nebula purple primary color */,
            "--secondary": "#03a9f4" /* Nebula blue secondary color */,
            "--tertiary": "#ffeb3b" /* Nebula yellow tertiary color */,
            "--quaternary": "#8bc34a" /* Nebula green quaternary color */,
            "--warning": "#ff9800" /* Bright orange warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#00bcd4" /* Bright cyan info color */,
            "--success": "#4caf50" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(156, 39, 176, 0.7)" /* Nebula purple shadow */,
            "--group-card-hover": "#26264c" /* Dark blue card hover color */,
            "--separator": "#3e3e5e" /* Dark blue separator */,
            "--select-background-color":
                "#1c1c2e" /* Deep space blue select background color */,
            "--select-text-color": "#e0e0e0" /* Light gray select text color */,
            "--select-focus-border-color":
                "#9c27b0" /* Nebula purple focus border color */,
            "--select-focus-box-shadow":
                "rgba(156, 39, 176, 0.3)" /* Nebula purple focus shadow */,
        },
        avengersTheme: {
            "--background": "#1f1f1f" /* Dark gray background */,
            "--light-background": "#2e2e2e" /* Medium dark gray surface */,
            "--surface": "#1f1f1f" /* Dark gray surface */,
            "--primary-text": "#e0e0e0" /* Light gray primary text */,
            "--secondary-text": "#bdbdbd" /* Medium gray secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#4f4f4f" /* Medium gray divider */,
            "--shadow": "rgba(31, 31, 31, 0.7)" /* Dark gray shadow */,
            "--primary": "#d32f2f" /* Bright red primary color */,
            "--secondary": "#1976d2" /* Bright blue secondary color */,
            "--tertiary": "#fbc02d" /* Bright yellow tertiary color */,
            "--quaternary": "#388e3c" /* Bright green quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(211, 47, 47, 0.7)" /* Bright red shadow */,
            "--group-card-hover":
                "#2e2e2e" /* Medium dark gray card hover color */,
            "--separator": "#4f4f4f" /* Medium gray separator */,
            "--select-background-color":
                "#1f1f1f" /* Dark gray select background color */,
            "--select-text-color": "#e0e0e0" /* Light gray select text color */,
            "--select-focus-border-color":
                "#d32f2f" /* Bright red focus border color */,
            "--select-focus-box-shadow":
                "rgba(211, 47, 47, 0.3)" /* Bright red focus shadow */,
        },
        electricLimeTheme: {
            "--background": "#1a1a1a" /* Dark gray background */,
            "--light-background": "#333333" /* Medium dark gray surface */,
            "--surface": "#1a1a1a" /* Dark gray surface */,
            "--primary-text": "#d4ff00" /* Electric lime primary text */,
            "--secondary-text": "#a0a000" /* Medium lime secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#3d3d00" /* Dark lime divider */,
            "--shadow": "rgba(26, 26, 26, 0.7)" /* Dark gray shadow */,
            "--primary": "#d4ff00" /* Electric lime primary color */,
            "--secondary": "#a0a000" /* Medium lime secondary color */,
            "--tertiary": "#ccff33" /* Bright lime tertiary color */,
            "--quaternary": "#ffff00" /* Yellow quaternary color */,
            "--warning": "#ffcc00" /* Bright orange warning color */,
            "--error": "#ff0033" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(212, 255, 0, 0.7)" /* Electric lime shadow */,
            "--group-card-hover":
                "#333333" /* Medium dark gray card hover color */,
            "--separator": "#3d3d00" /* Dark lime separator */,
            "--select-background-color":
                "#1a1a1a" /* Dark gray select background color */,
            "--select-text-color":
                "#d4ff00" /* Electric lime select text color */,
            "--select-focus-border-color":
                "#d4ff00" /* Electric lime focus border color */,
            "--select-focus-box-shadow":
                "rgba(212, 255, 0, 0.3)" /* Electric lime focus shadow */,
        },
        darkKnightTheme: {
            "--background": "#0d0d0d" /* Dark black background */,
            "--light-background": "#1a1a1a" /* Very dark gray surface */,
            "--surface": "#0d0d0d" /* Dark black surface */,
            "--primary-text": "#b0bec5" /* Light gray primary text */,
            "--secondary-text": "#78909c" /* Medium gray secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#546e7a" /* Medium gray divider */,
            "--shadow": "rgba(13, 13, 13, 0.7)" /* Dark black shadow */,
            "--primary": "#ffeb3b" /* Bright yellow primary color */,
            "--secondary": "#ffc107" /* Bright amber secondary color */,
            "--tertiary": "#f57c00" /* Bright orange tertiary color */,
            "--quaternary": "#d32f2f" /* Bright red quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(255, 235, 59, 0.7)" /* Bright yellow shadow */,
            "--group-card-hover":
                "#1a1a1a" /* Very dark gray card hover color */,
            "--separator": "#546e7a" /* Medium gray separator */,
            "--select-background-color":
                "#0d0d0d" /* Dark black select background color */,
            "--select-text-color": "#b0bec5" /* Light gray select text color */,
            "--select-focus-border-color":
                "#ffeb3b" /* Bright yellow focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 235, 59, 0.3)" /* Bright yellow focus shadow */,
        },
        matrixTheme: {
            "--background": "#000000" /* Black background */,
            "--light-background": "#1a1a1a" /* Very dark gray surface */,
            "--surface": "#0d0d0d" /* Dark black surface */,
            "--primary-text": "#00ff00" /* Neon green primary text */,
            "--secondary-text": "#00cc00" /* Bright green secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#333333" /* Dark gray divider */,
            "--shadow": "rgba(0, 0, 0, 0.7)" /* Black shadow */,
            "--primary": "#00ff00" /* Neon green primary color */,
            "--secondary": "#00cc00" /* Bright green secondary color */,
            "--tertiary": "#009900" /* Dark green tertiary color */,
            "--quaternary": "#006600" /* Deep green quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#ff0033" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(0, 255, 0, 0.7)" /* Neon green shadow */,
            "--group-card-hover":
                "#1a1a1a" /* Very dark gray card hover color */,
            "--separator": "#333333" /* Dark gray separator */,
            "--select-background-color":
                "#0d0d0d" /* Dark black select background color */,
            "--select-text-color": "#00ff00" /* Neon green select text color */,
            "--select-focus-border-color":
                "#00ff00" /* Neon green focus border color */,
            "--select-focus-box-shadow":
                "rgba(0, 255, 0, 0.3)" /* Neon green focus shadow */,
        },
        gatsbyTheme: {
            "--background": "#1c1c1c" /* Dark charcoal background */,
            "--light-background": "#2e2e2e" /* Medium charcoal surface */,
            "--surface": "#1c1c1c" /* Dark charcoal surface */,
            "--primary-text": "#ffd700" /* Gold primary text */,
            "--secondary-text": "#ffec8b" /* Light gold secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#b8860b" /* Dark gold divider */,
            "--shadow": "rgba(28, 28, 28, 0.7)" /* Dark charcoal shadow */,
            "--primary": "#ffd700" /* Gold primary color */,
            "--secondary": "#ffec8b" /* Light gold secondary color */,
            "--tertiary": "#ffc107" /* Amber tertiary color */,
            "--quaternary": "#ff9800" /* Bright orange quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow": "rgba(255, 215, 0, 0.7)" /* Gold shadow */,
            "--group-card-hover":
                "#2e2e2e" /* Medium charcoal card hover color */,
            "--separator": "#b8860b" /* Dark gold separator */,
            "--select-background-color":
                "#1c1c1c" /* Dark charcoal select background color */,
            "--select-text-color": "#ffd700" /* Gold select text color */,
            "--select-focus-border-color":
                "#ffd700" /* Gold focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 215, 0, 0.3)" /* Gold focus shadow */,
        },
        starWarsTheme: {
            "--background": "#000000" /* Black background */,
            "--light-background": "#1a1a1a" /* Very dark gray surface */,
            "--surface": "#000000" /* Black surface */,
            "--primary-text": "#ffe81f" /* Star Wars yellow primary text */,
            "--secondary-text": "#ffd700" /* Bright yellow secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#333333" /* Dark gray divider */,
            "--shadow": "rgba(0, 0, 0, 0.7)" /* Black shadow */,
            "--primary": "#ffe81f" /* Star Wars yellow primary color */,
            "--secondary": "#ffd700" /* Bright yellow secondary color */,
            "--tertiary": "#ffcc00" /* Yellow tertiary color */,
            "--quaternary": "#ff9900" /* Orange-yellow quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#ff0033" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(255, 232, 31, 0.7)" /* Star Wars yellow shadow */,
            "--group-card-hover":
                "#1a1a1a" /* Very dark gray card hover color */,
            "--separator": "#333333" /* Dark gray separator */,
            "--select-background-color":
                "#000000" /* Black select background color */,
            "--select-text-color":
                "#ffe81f" /* Star Wars yellow select text color */,
            "--select-focus-border-color":
                "#ffe81f" /* Star Wars yellow focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 232, 31, 0.3)" /* Star Wars yellow focus shadow */,
        },
        darkMatterTheme: {
            "--background": "#000000" /* Black background */,
            "--light-background": "#1a1a1a" /* Very dark gray surface */,
            "--surface": "#000000" /* Black surface */,
            "--primary-text": "#ffffff" /* White primary text */,
            "--secondary-text": "#b0b0b0" /* Medium gray secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#333333" /* Dark gray divider */,
            "--shadow": "rgba(0, 0, 0, 0.7)" /* Black shadow */,
            "--primary": "#ffcc00" /* Bright yellow primary color */,
            "--secondary": "#ff9900" /* Bright orange secondary color */,
            "--tertiary": "#ff6600" /* Bright orange tertiary color */,
            "--quaternary": "#ff3300" /* Bright red quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#ff0033" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(255, 204, 0, 0.7)" /* Bright yellow shadow */,
            "--group-card-hover":
                "#1a1a1a" /* Very dark gray card hover color */,
            "--separator": "#333333" /* Dark gray separator */,
            "--select-background-color":
                "#000000" /* Black select background color */,
            "--select-text-color": "#ffffff" /* White select text color */,
            "--select-focus-border-color":
                "#ffcc00" /* Bright yellow focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 204, 0, 0.3)" /* Bright yellow focus shadow */,
        },
        ghostbustersTheme: {
            "--background": "#000000" /* Black background */,
            "--light-background": "#1a1a1a" /* Very dark gray surface */,
            "--surface": "#000000" /* Black surface */,
            "--primary-text": "#e0e0e0" /* Light gray primary text */,
            "--secondary-text": "#bdbdbd" /* Medium gray secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#4f4f4f" /* Medium gray divider */,
            "--shadow": "rgba(0, 0, 0, 0.7)" /* Black shadow */,
            "--primary": "#ff0000" /* Bright red primary color */,
            "--secondary": "#00ff00" /* Bright green secondary color */,
            "--tertiary": "#0000ff" /* Bright blue tertiary color */,
            "--quaternary": "#ffff00" /* Bright yellow quaternary color */,
            "--warning": "#ffcc00" /* Bright yellow warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#33ccff" /* Bright cyan info color */,
            "--success": "#66ff66" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(255, 0, 0, 0.7)" /* Bright red shadow */,
            "--group-card-hover":
                "#1a1a1a" /* Very dark gray card hover color */,
            "--separator": "#4f4f4f" /* Medium gray separator */,
            "--select-background-color":
                "#000000" /* Black select background color */,
            "--select-text-color": "#e0e0e0" /* Light gray select text color */,
            "--select-focus-border-color":
                "#ff0000" /* Bright red focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 0, 0, 0.3)" /* Bright red focus shadow */,
        },
        cyberpunkNeonTheme: {
            "--background": "#0d0d0d" /* Dark black background */,
            "--light-background": "#1a1a1a" /* Very dark gray surface */,
            "--surface": "#0d0d0d" /* Dark black surface */,
            "--primary-text": "#f5f5f5" /* Light gray primary text */,
            "--secondary-text": "#bdbdbd" /* Medium gray secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#333333" /* Dark gray divider */,
            "--shadow": "rgba(13, 13, 13, 0.7)" /* Dark black shadow */,
            "--primary": "#ff00ff" /* Bright magenta primary color */,
            "--secondary": "#00ffff" /* Bright cyan secondary color */,
            "--tertiary": "#ffea00" /* Bright yellow tertiary color */,
            "--quaternary": "#ff1744" /* Bright red quaternary color */,
            "--warning": "#ff9800" /* Bright orange warning color */,
            "--error": "#f44336" /* Bright red error color */,
            "--info": "#2196f3" /* Bright blue info color */,
            "--success": "#4caf50" /* Bright green success color */,
            "--dropdown-box-shadow":
                "rgba(255, 0, 255, 0.7)" /* Bright magenta shadow */,
            "--group-card-hover":
                "#1a1a1a" /* Very dark gray card hover color */,
            "--separator": "#333333" /* Dark gray separator */,
            "--select-background-color":
                "#0d0d0d" /* Dark black select background color */,
            "--select-text-color": "#f5f5f5" /* Light gray select text color */,
            "--select-focus-border-color":
                "#ff00ff" /* Bright magenta focus border color */,
            "--select-focus-box-shadow":
                "rgba(255, 0, 255, 0.3)" /* Bright magenta focus shadow */,
        },
        midnightBlackTheme: {
            "--background": "#000000" /* Black background */,
            "--light-background": "#1a1a1a" /* Very dark gray surface */,
            "--surface": "#000000" /* Black surface as primary color */,
            "--primary-text": "#ffffff" /* White primary text */,
            "--secondary-text": "#b0b0b0" /* Light gray secondary text */,
            "--dark-text": "#ffffff" /* White text */,
            "--divider": "#4f4f4f" /* Dark gray divider */,
            "--shadow": "rgba(0, 0, 0, 0.7)" /* Black shadow */,
            "--primary": "#000000" /* Black primary color (surface) */,
            "--secondary": "#9e9e9e" /* Light gray secondary color */,
            "--warning": "#ffa726" /* Bright orange warning color */,
            "--error": "#e53935" /* Bright red error color */,
            "--info": "#29b6f6" /* Bright blue info color */,
            "--success": "#66bb6a" /* Bright green success color */,
            "--dropdown-box-shadow": "rgba(0, 0, 0, 0.7)" /* Black shadow */,
            "--group-card-hover":
                "#1a1a1a" /* Very dark gray card hover color */,
            "--separator": "#4f4f4f" /* Dark gray separator */,
            "--select-background-color":
                "#1a1a1a" /* Very dark gray select background color */,
            "--select-text-color": "#ffffff" /* White select text color */,
            "--select-focus-border-color":
                "#000000" /* Black focus border color */,
            "--select-focus-box-shadow":
                "rgba(0, 0, 0, 0.3)" /* Black focus shadow */,
        },
    };

    export function applyTheme(theme: string) {
        const themeProperties = themes[theme];
        for (const [property, value] of Object.entries(themeProperties)) {
            document.documentElement.style.setProperty(property, value);
        }
        currentTheme.set(theme);
        localStorage.setItem("selectedTheme", theme);
    }

    export const currentTheme: Writable<string> = writable("default");
</script>

<script lang="ts">
    import { onMount } from "svelte";

    onMount(() => {
        const savedTheme = localStorage.getItem("selectedTheme");
        if (savedTheme && themes[savedTheme]) {
            applyTheme(savedTheme);
        } else {
            applyTheme("default");
        }
    });
</script>

<div class="theme-switcher">
    <div class="grid grid-cols-12 gap-2">
        {#each Object.keys(themes) as theme}
            <button
                class="theme-button"
                style="background: linear-gradient(to right, {themes[theme][
                    '--background'
                ]} 40%, {themes[theme]['--surface']} 70%, {themes[theme][
                    '--primary'
                ]} 90%, {themes[theme]['--secondary']} 95%); color: {themes[
                    theme
                ]['--primary-text']};"
                on:click={() => applyTheme(theme)}
            >
                {theme
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
            </button>
        {/each}
    </div>
</div>

<style>
    .theme-switcher {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    .theme-button {
        padding: 5px;
        cursor: pointer;
        border: none;
        border-radius: 5px;
        transition:
            background-color 0.3s ease,
            color 0.3s ease;
        text-align: center;
        width: 75px;
        height: 45px;
    }
</style>
