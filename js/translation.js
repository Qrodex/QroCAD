var prefLang = localStorage.getItem("prefLang") || "default";

async function translateOrLoadFromCache(word, targetLang) {
    if (/^\s+$/.test(word)) return word;
    if (targetLang == "default") return word;

    if (localStorage.getItem("translations")) {
        var translations = JSON.parse(localStorage.getItem("translations"));
    } else {
        localStorage.setItem("translations", JSON.stringify({}));
        var translations = JSON.parse(localStorage.getItem("translations"));
    }

    if (!translations[targetLang]) {
        translations[targetLang] = {};
    }

    if (translations[targetLang][word]) {
        return translations[targetLang][word]
    } else {
        let url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en" + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(word);
        try {
            let response = await fetch(url);
            let data = await response.json();
            let translated = data[0][0][0];

            translations[targetLang][word] = translated
            localStorage.setItem("translations", JSON.stringify(translations));

            return translated;
        } catch (error) {
            return word;
        }
    }
};

async function startAutomaticTranslation() {
    for (let item of document.getElementsByTagName("span")) {
        item.innerText = await translateOrLoadFromCache(item.innerText, prefLang)
    }

    for (let item of document.getElementsByTagName("option")) {
        item.innerText = await translateOrLoadFromCache(item.innerText, prefLang)
    }

    for (let item of document.getElementsByTagName("*")) {
        if (item.title) {
            item.title = await translateOrLoadFromCache(item.title, prefLang)
        } else if (item.placeholder) {
            item.placeholder = await translateOrLoadFromCache(item.placeholder, prefLang)
        }
    }
}

async function changeLang(lang) {
    localStorage.setItem('prefLang', lang);
    window.alert(await translateOrLoadFromCache('Please reload the page to apply the changes.', prefLang))
}