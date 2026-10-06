/* =========================================================
   AUTO MARKETING WEB
   GLOBAL LANGUAGE ENGINE
   Version: 3.0.0

   Supported:
   - ID
   - EN
   - AR

   Features:
   - ID -> EN
   - ID -> AR
   - EN -> ID
   - EN -> AR
   - AR -> ID
   - AR -> EN

   No translation API.
   No AMV language API.
   No external request.

   Language persistence:
   localStorage

   Switcher:
   inside .nav-wrap
   ========================================================= */

(function () {
    "use strict";


    /* =====================================================
       CONFIG
       ===================================================== */

    const CONFIG = {

        storageKey:
            "AUTO_MARKETING_GLOBAL_LANGUAGE",

        defaultLanguage:
            "id",

        languages: {

            id: {
                code: "id",
                label: "ID",
                name: "Indonesia",
                direction: "ltr"
            },

            en: {
                code: "en",
                label: "EN",
                name: "English",
                direction: "ltr"
            },

            ar: {
                code: "ar",
                label: "AR",
                name: "العربية",
                direction: "rtl"
            }

        },

        switcherClass:
            "am-global-language-switcher",

        activeClass:
            "is-active"

    };


    /* =====================================================
       STATE
       ===================================================== */

    const state = {

        currentLanguage:
            CONFIG.defaultLanguage,

        observer:
            null,

        initialized:
            false,

        applying:
            false,

        /*
         * Stores the canonical translation key
         * for each text node.
         *
         * Example:
         *
         * Indonesian key:
         * "Cara Kerja"
         *
         * Current DOM:
         * "How It Works"
         *
         * The node still resolves to:
         * "Cara Kerja"
         */
        canonicalText:
            new WeakMap(),

        /*
         * Stores original attributes.
         */
        originalAttributes:
            new WeakMap(),

        /*
         * Reverse lookup cache.
         *
         * value:
         * "How It Works"
         *
         * resolves to:
         * "Cara Kerja"
         */
        reverseLookup:
            null,

        reverseLookupSource:
            null

    };


    /* =====================================================
       TRANSLATION SOURCE
       ===================================================== */

    function getTranslations() {

        return (
            window.AUTO_MARKETING_TRANSLATIONS ||
            {}
        );

    }


    /* =====================================================
       LANGUAGE VALIDATION
       ===================================================== */

    function isSupported(language) {

        if (!language) {
            return false;
        }

        const normalized =
            String(language)
                .trim()
                .toLowerCase()
                .split("-")[0];

        return Object.prototype.hasOwnProperty.call(
            CONFIG.languages,
            normalized
        );

    }


    function normalizeLanguage(language) {

        if (!language) {
            return CONFIG.defaultLanguage;
        }

        const normalized =
            String(language)
                .trim()
                .toLowerCase()
                .split("-")[0];

        return isSupported(normalized)
            ? normalized
            : CONFIG.defaultLanguage;

    }


    /* =====================================================
       LOCAL STORAGE
       ===================================================== */

    function readStoredLanguage() {

        try {

            const stored =
                localStorage.getItem(
                    CONFIG.storageKey
                );

            return normalizeLanguage(
                stored
            );

        } catch (error) {

            return CONFIG.defaultLanguage;

        }

    }


    function saveLanguage(language) {

        try {

            localStorage.setItem(
                CONFIG.storageKey,
                normalizeLanguage(language)
            );

        } catch (error) {

            /*
             * Ignore storage errors.
             */

        }

    }


    /* =====================================================
       TEXT NORMALIZATION
       ===================================================== */

    function normalizeText(text) {

        return String(text || "")
            .replace(/\s+/g, " ")
            .trim();

    }


    /* =====================================================
       TRANSLATION LOOKUP CACHE
       ===================================================== */

    function buildReverseLookup() {

        const translations =
            getTranslations();

        /*
         * Rebuild only if dictionary changed.
         */
        if (
            state.reverseLookup &&
            state.reverseLookupSource ===
                translations
        ) {

            return state.reverseLookup;

        }


        const reverse =
            Object.create(null);


        Object.keys(translations)
            .forEach(function (key) {

                const entry =
                    translations[key];

                if (
                    !entry ||
                    typeof entry !== "object"
                ) {
                    return;
                }


                /*
                 * Every supported language becomes
                 * a valid lookup value.
                 */
                Object.keys(
                    CONFIG.languages
                )
                .forEach(function (language) {

                    const value =
                        entry[language];

                    if (
                        value == null ||
                        value === ""
                    ) {
                        return;
                    }

                    const normalized =
                        normalizeText(value);

                    if (!normalized) {
                        return;
                    }

                    /*
                     * First matching key wins.
                     *
                     * This is important because some
                     * dictionary entries may share
                     * the same displayed text.
                     */
                    if (
                        !reverse[normalized]
                    ) {

                        reverse[normalized] =
                            key;

                    }

                });

            });


        state.reverseLookup =
            reverse;

        state.reverseLookupSource =
            translations;


        return reverse;

    }


    /* =====================================================
       RESOLVE CANONICAL KEY
       ===================================================== */

    function resolveCanonicalKey(
        text
    ) {

        const normalized =
            normalizeText(text);

        if (!normalized) {
            return null;
        }


        const translations =
            getTranslations();


        /*
         * 1. Direct Indonesian key.
         */
        if (
            Object.prototype.hasOwnProperty.call(
                translations,
                normalized
            )
        ) {

            return normalized;

        }


        /*
         * 2. Reverse lookup:
         *
         * EN -> ID key
         * AR -> ID key
         */
        const reverse =
            buildReverseLookup();


        if (
            Object.prototype.hasOwnProperty.call(
                reverse,
                normalized
            )
        ) {

            return reverse[normalized];

        }


        return null;

    }


    /* =====================================================
       TRANSLATION ENTRY
       ===================================================== */

    function getTranslationEntry(key) {

        const translations =
            getTranslations();

        if (!key) {
            return null;
        }

        if (
            !Object.prototype.hasOwnProperty.call(
                translations,
                key
            )
        ) {
            return null;
        }

        return translations[key];

    }


    /* =====================================================
       TRANSLATE TEXT
       ===================================================== */

    function translateText(
        text,
        language
    ) {

        const normalized =
            normalizeText(text);

        if (!normalized) {
            return text;
        }


        const targetLanguage =
            normalizeLanguage(language);


        const canonicalKey =
            resolveCanonicalKey(
                normalized
            );


        if (!canonicalKey) {
            return text;
        }


        const entry =
            getTranslationEntry(
                canonicalKey
            );


        if (!entry) {
            return text;
        }


        const translated =
            entry[targetLanguage];


        if (
            translated == null ||
            translated === ""
        ) {
            return text;
        }


        return translated;

    }


    /* =====================================================
       TEXT NODE HANDLING
       ===================================================== */

    function shouldIgnoreNode(node) {

        if (!node) {
            return true;
        }


        const parent =
            node.parentElement;

        if (!parent) {
            return true;
        }


        /*
         * Never translate the language switcher.
         */
        if (
            parent.closest(
                "." + CONFIG.switcherClass
            )
        ) {
            return true;
        }


        const tag =
            parent.tagName;


        if (
            tag === "SCRIPT" ||
            tag === "STYLE" ||
            tag === "NOSCRIPT" ||
            tag === "CODE" ||
            tag === "PRE"
        ) {
            return true;
        }


        /*
         * Ignore hidden technical elements.
         */
        if (
            parent.closest(
                "[data-am-language-ignore]"
            )
        ) {
            return true;
        }


        return false;

    }


    /* =====================================================
       CANONICAL NODE MEMORY
       ===================================================== */

    function getCanonicalForNode(
        node
    ) {

        if (
            state.canonicalText.has(node)
        ) {

            return state.canonicalText.get(
                node
            );

        }


        const current =
            normalizeText(
                node.nodeValue
            );


        const canonical =
            resolveCanonicalKey(
                current
            );


        if (canonical) {

            state.canonicalText.set(
                node,
                canonical
            );

        }


        return canonical;

    }


    function rememberCanonicalForNode(
        node,
        key
    ) {

        if (!node || !key) {
            return;
        }

        state.canonicalText.set(
            node,
            key
        );

    }


    /* =====================================================
       TEXT NODE TRANSLATION
       ===================================================== */

    function translateTextNode(
        node,
        language
    ) {

        if (
            !node ||
            node.nodeType !== Node.TEXT_NODE
        ) {
            return;
        }


        if (
            shouldIgnoreNode(node)
        ) {
            return;
        }


        const originalValue =
            String(
                node.nodeValue || ""
            );


        const normalizedCurrent =
            normalizeText(
                originalValue
            );


        if (!normalizedCurrent) {
            return;
        }


        /*
         * Find canonical Indonesian key.
         *
         * This is the critical difference
         * from v2.0.0.
         */
        let canonicalKey =
            getCanonicalForNode(node);


        /*
         * If the node was created dynamically
         * after initialization, resolve it now.
         */
        if (!canonicalKey) {

            canonicalKey =
                resolveCanonicalKey(
                    normalizedCurrent
                );

        }


        if (!canonicalKey) {
            return;
        }


        rememberCanonicalForNode(
            node,
            canonicalKey
        );


        const entry =
            getTranslationEntry(
                canonicalKey
            );


        if (!entry) {
            return;
        }


        const translated =
            entry[
                normalizeLanguage(language)
            ];


        if (
            translated == null
        ) {
            return;
        }


        /*
         * Preserve whitespace around text.
         */
        const leading =
            originalValue.match(
                /^\s*/
            )?.[0] || "";


        const trailing =
            originalValue.match(
                /\s*$/
            )?.[0] || "";


        const nextValue =
            leading +
            translated +
            trailing;


        /*
         * Avoid unnecessary DOM writes.
         */
        if (
            node.nodeValue !== nextValue
        ) {

            node.nodeValue =
                nextValue;

        }

    }


    /* =====================================================
       DATA-I18N SUPPORT
       ===================================================== */

    function translateDataI18nElement(
        element,
        language
    ) {

        if (
            !element ||
            element.nodeType !== 1
        ) {
            return;
        }


        const key =
            element.getAttribute(
                "data-i18n"
            );


        if (!key) {
            return;
        }


        const translations =
            getTranslations();


        const entry =
            translations[key];


        if (!entry) {
            return;
        }


        const translated =
            entry[
                normalizeLanguage(language)
            ];


        if (
            translated == null
        ) {
            return;
        }


        /*
         * Keep the canonical key.
         */
        element.setAttribute(
            "data-am-language-key",
            key
        );


        /*
         * textContent is intentional here because
         * data-i18n explicitly declares the whole
         * element as translatable.
         */
        if (
            element.textContent !==
            translated
        ) {

            element.textContent =
                translated;

        }

    }


    /* =====================================================
       DATA ATTRIBUTE TRANSLATION
       ===================================================== */

    function rememberAttribute(
        element,
        attribute
    ) {

        if (!element) {
            return;
        }


        if (
            !state.originalAttributes.has(
                element
            )
        ) {

            state.originalAttributes.set(
                element,
                {}
            );

        }


        const data =
            state.originalAttributes.get(
                element
            );


        if (
            !Object.prototype.hasOwnProperty.call(
                data,
                attribute
            )
        ) {

            data[attribute] =
                element.getAttribute(
                    attribute
                );

        }

    }


    function translateDataAttributes(
        element,
        language
    ) {

        if (
            !element ||
            element.nodeType !== 1
        ) {
            return;
        }


        const translations =
            getTranslations();


        const attributes = [
            "placeholder",
            "title",
            "aria-label"
        ];


        attributes.forEach(
            function (attribute) {

                const keyAttribute =
                    "data-i18n-" +
                    attribute;


                const key =
                    element.getAttribute(
                        keyAttribute
                    );


                if (!key) {
                    return;
                }


                const entry =
                    translations[key];


                if (!entry) {
                    return;
                }


                const translated =
                    entry[
                        normalizeLanguage(
                            language
                        )
                    ];


                if (
                    translated == null
                ) {
                    return;
                }


                rememberAttribute(
                    element,
                    attribute
                );


                element.setAttribute(
                    attribute,
                    translated
                );

            }
        );

    }


    /* =====================================================
       PAGE TRANSLATION
       ===================================================== */

    function translatePage(
        language
    ) {

        if (state.applying) {
            return;
        }


        state.applying = true;


        try {

            /*
             * Explicit data-i18n elements.
             */
            document
                .querySelectorAll(
                    "[data-i18n]"
                )
                .forEach(
                    function (element) {

                        translateDataI18nElement(
                            element,
                            language
                        );

                        translateDataAttributes(
                            element,
                            language
                        );

                    }
                );


            /*
             * Ordinary visible text nodes.
             */
            const walker =
                document.createTreeWalker(
                    document.body,
                    NodeFilter.SHOW_TEXT
                );


            const nodes = [];


            let node;


            while (
                (node = walker.nextNode())
            ) {

                nodes.push(node);

            }


            nodes.forEach(
                function (textNode) {

                    translateTextNode(
                        textNode,
                        language
                    );

                }
            );


            /*
             * Common attributes.
             */
            document
                .querySelectorAll(
                    "input, textarea, button"
                )
                .forEach(
                    function (element) {

                        translateDataAttributes(
                            element,
                            language
                        );

                    }
                );


        } finally {

            state.applying = false;

        }

    }


    /* =====================================================
       RTL / LTR
       ===================================================== */

    function applyDirection(
        language
    ) {

        const config =
            CONFIG.languages[
                language
            ];


        if (!config) {
            return;
        }


        document.documentElement.lang =
            config.code;


        document.documentElement.dir =
            config.direction;


        if (document.body) {

            document.body.setAttribute(
                "dir",
                config.direction
            );


            document.body.classList.toggle(
                "am-language-rtl",
                config.direction ===
                    "rtl"
            );


            document.body.classList.toggle(
                "am-language-ltr",
                config.direction ===
                    "ltr"
            );

        }

    }


    /* =====================================================
       SWITCHER CONTAINER
       ===================================================== */

    function getSwitcherContainer() {

        return document.querySelector(
            ".nav-wrap"
        );

    }


    /* =====================================================
       SWITCHER
       ===================================================== */

    function createSwitcher() {

        let switcher =
            document.querySelector(
                "." +
                CONFIG.switcherClass
            );


        if (switcher) {
            return switcher;
        }


        const container =
            getSwitcherContainer();


        if (!container) {
            return null;
        }


        switcher =
            document.createElement(
                "div"
            );


        switcher.className =
            CONFIG.switcherClass;


        /*
         * Tell the language engine not
         * to translate this UI.
         */
        switcher.setAttribute(
            "data-am-language-ignore",
            "true"
        );


        switcher.setAttribute(
            "aria-label",
            "Language selector"
        );


        switcher.setAttribute(
            "role",
            "group"
        );


        Object.keys(
            CONFIG.languages
        ).forEach(
            function (code) {

                const language =
                    CONFIG.languages[
                        code
                    ];


                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "am-language-button";


                button.dataset.language =
                    language.code;


                button.textContent =
                    language.label;


                button.title =
                    language.name;


                button.setAttribute(
                    "aria-label",
                    language.name
                );


                button.addEventListener(
                    "click",
                    function () {

                        setLanguage(
                            language.code
                        );

                    }
                );


                switcher.appendChild(
                    button
                );

            }
        );


        /*
         * Switcher remains INSIDE .nav-wrap.
         */
        container.appendChild(
            switcher
        );


        injectSwitcherStyles();


        return switcher;

    }


    /* =====================================================
       SWITCHER UI STATE
       ===================================================== */

    function updateSwitcher(
        language
    ) {

        const switcher =
            document.querySelector(
                "." +
                CONFIG.switcherClass
            );


        if (!switcher) {
            return;
        }


        switcher
            .querySelectorAll(
                ".am-language-button"
            )
            .forEach(
                function (button) {

                    const isActive =
                        button.dataset
                            .language ===
                        language;


                    button.classList.toggle(
                        CONFIG.activeClass,
                        isActive
                    );


                    button.setAttribute(
                        "aria-pressed",
                        String(
                            isActive
                        )
                    );

                }
            );

    }


    /* =====================================================
       SWITCHER STYLE
       ===================================================== */

    function injectSwitcherStyles() {

        if (
            document.getElementById(
                "am-global-language-style"
            )
        ) {
            return;
        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "am-global-language-style";


        style.textContent = `

            .am-global-language-switcher {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
                flex-shrink: 0;
                margin-left: 12px;
                padding: 3px;
                border: 1px solid rgba(212, 175, 55, 0.35);
                border-radius: 999px;
                background: rgba(0, 0, 0, 0.55);
                box-sizing: border-box;
                z-index: 20;
            }

            .am-global-language-switcher
            .am-language-button {
                appearance: none;
                border: 0;
                outline: none;
                cursor: pointer;
                min-width: 34px;
                height: 30px;
                padding: 0 8px;
                border-radius: 999px;
                background: transparent;
                color: #bdbdbd;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.04em;
                line-height: 30px;
                text-align: center;
                transition:
                    background 0.2s ease,
                    color 0.2s ease,
                    transform 0.2s ease;
            }

            .am-global-language-switcher
            .am-language-button:hover {
                color: #ffffff;
            }

            .am-global-language-switcher
            .am-language-button:active {
                transform: scale(0.95);
            }

            .am-global-language-switcher
            .am-language-button.is-active {
                background: #D4AF37;
                color: #050505;
            }

            html[dir="rtl"]
            .am-global-language-switcher {
                margin-left: 0;
                margin-right: 12px;
            }

            @media (max-width: 900px) {

                .am-global-language-switcher {
                    margin-left: 8px;
                }

                html[dir="rtl"]
                .am-global-language-switcher {
                    margin-left: 0;
                    margin-right: 8px;
                }

            }

            @media (max-width: 560px) {

                .am-global-language-switcher {
                    gap: 2px;
                    margin-left: 6px;
                    padding: 2px;
                }

                html[dir="rtl"]
                .am-global-language-switcher {
                    margin-left: 0;
                    margin-right: 6px;
                }

                .am-global-language-switcher
                .am-language-button {
                    min-width: 30px;
                    height: 27px;
                    padding: 0 6px;
                    font-size: 10px;
                    line-height: 27px;
                }

            }

        `;


        document.head.appendChild(
            style
        );

    }


    /* =====================================================
       LANGUAGE SETTER
       ===================================================== */

    function setLanguage(
        language
    ) {

        const normalized =
            normalizeLanguage(
                language
            );


        state.currentLanguage =
            normalized;


        saveLanguage(
            normalized
        );


        applyDirection(
            normalized
        );


        /*
         * Critical:
         *
         * translatePage() now resolves
         * the current EN/AR text back to
         * its canonical dictionary key.
         */
        translatePage(
            normalized
        );


        updateSwitcher(
            normalized
        );


        document.documentElement
            .setAttribute(
                "data-am-language",
                normalized
            );


        /*
         * Keep public global state updated.
         */
        window.AUTO_MARKETING_LANGUAGE =
            normalized;


        /*
         * Notify other ecosystem components.
         */
        window.dispatchEvent(
            new CustomEvent(
                "autoMarketingLanguageChange",
                {
                    detail: {
                        language:
                            normalized
                    }
                }
            )
        );

    }


    /* =====================================================
       MUTATION OBSERVER
       ===================================================== */

    function startObserver() {

        if (state.observer) {
            return;
        }


        if (!document.body) {
            return;
        }


        state.observer =
            new MutationObserver(
                function (mutations) {

                    if (
                        state.applying
                    ) {
                        return;
                    }


                    let shouldTranslate =
                        false;


                    mutations.forEach(
                        function (mutation) {

                            if (
                                mutation.type ===
                                "childList"
                            ) {

                                if (
                                    mutation.addedNodes &&
                                    mutation
                                        .addedNodes
                                        .length
                                ) {

                                    shouldTranslate =
                                        true;

                                }

                            }


                            if (
                                mutation.type ===
                                "attributes"
                            ) {

                                if (
                                    mutation.attributeName ===
                                    "data-i18n"
                                ) {

                                    shouldTranslate =
                                        true;

                                }

                            }

                        }
                    );


                    if (
                        shouldTranslate
                    ) {

                        window.requestAnimationFrame(
                            function () {

                                translatePage(
                                    state.currentLanguage
                                );


                                updateSwitcher(
                                    state.currentLanguage
                                );

                            }
                        );

                    }

                }
            );


        state.observer.observe(
            document.body,
            {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: [
                    "data-i18n"
                ]
            }
        );

    }


    /* =====================================================
       CROSS-TAB LANGUAGE SYNC
       ===================================================== */

    function startStorageListener() {

        window.addEventListener(
            "storage",
            function (event) {

                if (
                    event.key !==
                    CONFIG.storageKey
                ) {
                    return;
                }


                const language =
                    normalizeLanguage(
                        event.newValue
                    );


                if (
                    language ===
                    state.currentLanguage
                ) {
                    return;
                }


                setLanguage(
                    language
                );

            }
        );

    }


    /* =====================================================
       NAVIGATION PERSISTENCE
       ===================================================== */

    function ensureLanguageBeforeNavigation() {

        window.addEventListener(
            "beforeunload",
            function () {

                saveLanguage(
                    state.currentLanguage
                );

            }
        );

    }


    /* =====================================================
       INITIALIZATION
       ===================================================== */

    function initialize() {

        if (
            state.initialized
        ) {
            return;
        }


        state.initialized =
            true;


        const savedLanguage =
            readStoredLanguage();


        state.currentLanguage =
            savedLanguage;


        /*
         * Build reverse dictionary
         * before translating the page.
         */
        buildReverseLookup();


        injectSwitcherStyles();


        /*
         * Create switcher after DOM exists.
         */
        createSwitcher();


        applyDirection(
            state.currentLanguage
        );


        translatePage(
            state.currentLanguage
        );


        updateSwitcher(
            state.currentLanguage
        );


        startObserver();


        startStorageListener();


        ensureLanguageBeforeNavigation();


        window.AUTO_MARKETING_LANGUAGE =
            state.currentLanguage;


        console.log(
            "AUTO MARKETING Global Language:",
            state.currentLanguage
        );

    }


    /* =====================================================
       PUBLIC API
       ===================================================== */

    window.AutoMarketingLanguage = {

        getLanguage:
            function () {

                return state.currentLanguage;

            },


        setLanguage:
            function (language) {

                setLanguage(
                    language
                );

            },


        getSupportedLanguages:
            function () {

                return Object.keys(
                    CONFIG.languages
                );

            },


        translate:
            function (
                text,
                language
            ) {

                return translateText(
                    text,
                    normalizeLanguage(
                        language ||
                        state.currentLanguage
                    )
                );

            }

    };


    /* =====================================================
       START
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once: true
            }
        );

    } else {

        initialize();

    }

})();