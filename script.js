(() => {
  "use strict";

  /*
   * AUTO MARKETING
   * Web AM Public Controller
   *
   * Fungsi:
   * 1. Mobile navigation
   * 2. Internal section navigation
   * 3. Active navigation state
   * 4. Safe local-page navigation
   * 5. Reveal animation
   * 6. Current year
   * 7. Intake form validation
   * 8. Central Backend intake handler
   * 9. Visible error/status handling
   */

  document.documentElement.classList.add("js");

  /* =========================================
     ELEMENTS
  ========================================= */

  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  const year = document.getElementById("year");

  const form = document.getElementById("intakeForm");
  const formStatus = document.getElementById("formStatus");

  /* =========================================
     CONFIG
  ========================================= */

  /*
   * CENTRAL BACKEND
   *
   * Endpoint resmi Web AM Intake:
   *
   * POST /api/v1/web-am/intake
   *
   * Untuk TEST LOKAL:
   *
   * http://127.0.0.1:8090/api/v1/web-am/intake
   *
   * PENTING:
   * URL 127.0.0.1 hanya untuk pengujian dari
   * perangkat yang menjalankan Central Backend.
   *
   * Untuk production GitHub Pages, URL ini harus
   * diganti dengan domain HTTPS Central Backend
   * yang dapat diakses publik.
   */

  const INTAKE_ENDPOINT =
    "http://127.0.0.1:8090/api/v1/web-am/intake";

  /*
   * Halaman internal Web AM.
   *
   * Kalau file belum tersedia, sistem akan memberi
   * pesan "Updating sistem..." daripada membawa
   * user ke halaman error.
   */

  const LOCAL_PAGES = [
    "am-plus.html"
  ];

  /* =========================================
     YEAR
  ========================================= */

  if (year) {
    year.textContent = String(
      new Date().getFullYear()
    );
  }

  /* =========================================
     MOBILE MENU
  ========================================= */

  function openMenu() {
    if (!mainNav || !menuToggle) {
      return;
    }

    mainNav.classList.add("open");

    menuToggle.setAttribute(
      "aria-expanded",
      "true"
    );
  }

  function closeMenu() {
    if (!mainNav || !menuToggle) {
      return;
    }

    mainNav.classList.remove("open");

    menuToggle.setAttribute(
      "aria-expanded",
      "false"
    );
  }

  function toggleMenu() {
    if (!mainNav || !menuToggle) {
      return;
    }

    const isOpen =
      mainNav.classList.contains("open");

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  if (menuToggle && mainNav) {

    menuToggle.addEventListener(
      "click",
      (event) => {

        event.preventDefault();
        event.stopPropagation();

        toggleMenu();

      }
    );

    mainNav
      .querySelectorAll("a")
      .forEach((link) => {

        link.addEventListener(
          "click",
          () => {
            closeMenu();
          }
        );

      });

    /*
     * Klik di luar menu mobile -> tutup.
     */

    document.addEventListener(
      "click",
      (event) => {

        if (
          !mainNav.classList.contains("open")
        ) {
          return;
        }

        const clickedInsideNav =
          mainNav.contains(event.target);

        const clickedToggle =
          menuToggle.contains(event.target);

        if (
          !clickedInsideNav &&
          !clickedToggle
        ) {
          closeMenu();
        }

      }
    );

  }

  /*
   * ESC -> tutup menu.
   */

  document.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Escape") {
        closeMenu();
      }

    }
  );

  /*
   * Jika layar berubah dari mobile ke desktop,
   * reset status menu.
   */

  window.addEventListener(
    "resize",
    () => {

      if (window.innerWidth > 900) {
        closeMenu();
      }

    }
  );

  /* =========================================
     INTERNAL HASH NAVIGATION
  ========================================= */

  function scrollToHash(hash) {

    if (!hash || hash === "#") {
      return false;
    }

    const target =
      document.querySelector(hash);

    if (!target) {
      return false;
    }

    /*
     * History diperbarui tanpa reload halaman.
     */

    if (
      window.location.hash !== hash
    ) {

      try {

        history.pushState(
          null,
          "",
          hash
        );

      } catch (error) {

        /*
         * Browser lama / WebView tertentu.
         * Fallback tidak perlu melakukan apa-apa.
         */

      }

    }

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    return true;
  }

  /*
   * Tangani semua link #section.
   */

  document
    .querySelectorAll('a[href^="#"]')
    .forEach((link) => {

      link.addEventListener(
        "click",
        (event) => {

          const href =
            link.getAttribute("href");

          if (!href || href === "#") {
            return;
          }

          const target =
            document.querySelector(href);

          if (!target) {
            return;
          }

          event.preventDefault();

          closeMenu();

          scrollToHash(href);

        }
      );

    });

  /*
   * Jika halaman dibuka dengan:
   *
   * index.html#amplus
   *
   * tetapi elemen #amplus tidak ada,
   * jangan biarkan browser terlihat "diam".
   *
   * Di index ini AM+ sebenarnya berupa
   * file am-plus.html, bukan section #amplus.
   */

  window.addEventListener(
    "hashchange",
    () => {

      const hash =
        window.location.hash;

      if (!hash) {
        return;
      }

      const target =
        document.querySelector(hash);

      if (target) {

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

      }

    }
  );

  /* =========================================
     ACTIVE NAVIGATION
  ========================================= */

  const navLinks = Array.from(
    document.querySelectorAll(
      '#mainNav a[href^="#"]'
    )
  );

  const sectionTargets = navLinks
    .map((link) => {

      const hash =
        link.getAttribute("href");

      if (!hash || hash === "#") {
        return null;
      }

      return document.querySelector(hash);

    })
    .filter(Boolean);

  function setActiveNav(section) {

    if (!section) {
      return;
    }

    const id = section.id;

    navLinks.forEach((link) => {

      const isActive =
        link.getAttribute("href") ===
        `#${id}`;

      link.classList.toggle(
        "active",
        isActive
      );

    });

  }

  if (
    "IntersectionObserver" in window &&
    sectionTargets.length > 0
  ) {

    const navObserver =
      new IntersectionObserver(
        (entries) => {

          const visibleEntries =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting
              )
              .sort(
                (a, b) =>
                  b.intersectionRatio -
                  a.intersectionRatio
              );

          if (
            visibleEntries.length > 0
          ) {

            setActiveNav(
              visibleEntries[0].target
            );

          }

        },
        {
          root: null,
          rootMargin:
            "-25% 0px -60% 0px",
          threshold: [
            0,
            0.1,
            0.25,
            0.5
          ]
        }
      );

    sectionTargets.forEach(
      (section) => {
        navObserver.observe(section);
      }
    );

  }

  /* =========================================
     REVEAL ANIMATION
  ========================================= */

  const reveals =
    document.querySelectorAll(".reveal");

  if (
    "IntersectionObserver" in window &&
    reveals.length > 0
  ) {

    const revealObserver =
      new IntersectionObserver(
        (entries, observer) => {

          entries.forEach((entry) => {

            if (
              !entry.isIntersecting
            ) {
              return;
            }

            entry.target.classList.add(
              "visible"
            );

            observer.unobserve(
              entry.target
            );

          });

        },
        {
          threshold: 0.08,
          rootMargin:
            "0px 0px -30px 0px"
        }
      );

    reveals.forEach((element) => {
      revealObserver.observe(element);
    });

  } else {

    /*
     * Browser tanpa IntersectionObserver.
     */

    reveals.forEach((element) => {
      element.classList.add("visible");
    });

  }

  /* =========================================
     LOCAL PAGE CHECK
  ========================================= */

  async function checkLocalPage(
    filename
  ) {

    /*
     * Untuk file lokal di WebView/SPCK,
     * fetch() dapat dibatasi oleh browser.
     *
     * Karena itu kita tetap menyediakan
     * fallback navigasi langsung.
     */

    try {

      const response =
        await fetch(
          filename,
          {
            method: "HEAD",
            cache: "no-store"
          }
        );

      return response.ok;

    } catch (error) {

      /*
       * Fetch terhadap file lokal dapat gagal
       * meskipun file sebenarnya ada.
       *
       * Jangan menganggap otomatis file tidak ada.
       */

      return null;
    }

  }

  function showSystemUpdating() {

    /*
     * Jangan menggunakan alert untuk setiap
     * navigasi normal.
     *
     * Tetapi untuk file yang belum tersedia,
     * alert memberi feedback yang jelas kepada user.
     */

    window.alert(
      "Updating sistem..."
    );

  }

  async function openLocalPage(
    filename
  ) {

    if (!filename) {
      return;
    }

    const result =
      await checkLocalPage(filename);

    /*
     * File dipastikan tersedia.
     */

    if (result === true) {

      window.location.href =
        filename;

      return;
    }

    /*
     * Fetch gagal tetapi file mungkin
     * sebenarnya tersedia di WebView lokal.
     *
     * Coba navigasi langsung.
     *
     * Ini penting untuk kompatibilitas SPCK.
     */

    if (result === null) {

      window.location.href =
        filename;

      return;
    }

    /*
     * HTTP 404 / file benar-benar tidak ada.
     */

    showSystemUpdating();

  }

  /* =========================================
     LOCAL PAGE LINKS
  ========================================= */

  document
    .querySelectorAll("a[href]")
    .forEach((link) => {

      const href =
        link.getAttribute("href");

      if (!href) {
        return;
      }

      /*
       * Jangan ganggu:
       *
       * #anchor
       * http
       * https
       * mailto
       * tel
       * javascript
       */

      if (
        href.startsWith("#") ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("javascript:")
      ) {
        return;
      }

      /*
       * Hanya proses halaman lokal
       * yang memang sudah didefinisikan.
       */

      if (
        !LOCAL_PAGES.includes(href)
      ) {
        return;
      }

      link.addEventListener(
        "click",
        async (event) => {

          event.preventDefault();

          closeMenu();

          await openLocalPage(href);

        }
      );

    });

  /* =========================================
     INTAKE FORM HELPERS
  ========================================= */

  function setFormStatus(
    message,
    type = "info"
  ) {

    if (!formStatus) {
      return;
    }

    formStatus.textContent =
      message;

    formStatus.classList.remove(
      "success",
      "error",
      "info"
    );

    formStatus.classList.add(
      type
    );

  }

  function normalizePhone(
    value
  ) {

    return String(value || "")
      .replace(/[^\d+]/g, "")
      .trim();

  }

  function validateForm(data) {

    if (!data.name) {
      return "Nama wajib diisi.";
    }

    if (!data.business) {
      return "Nama bisnis wajib diisi.";
    }

    if (!data.product_service) {
      return "Produk / jasa wajib diisi.";
    }

    if (!data.need) {
      return (
        "Masalah / kebutuhan pemasaran wajib diisi."
      );
    }

    const whatsapp =
      normalizePhone(
        data.whatsapp
      );

    if (!whatsapp) {
      return (
        "Nomor WhatsApp wajib diisi."
      );
    }

    const digits =
      whatsapp.replace(
        /\D/g,
        ""
      );

    if (digits.length < 9) {
      return (
        "Nomor WhatsApp tidak valid."
      );
    }

    return null;

  }

  /* =========================================
     FORM SUBMIT
  ========================================= */

  if (form) {

    form.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();

        const submitButton =
          form.querySelector(
            "button[type='submit']"
          );

        /*
         * Ambil semua field dari form HTML.
         */

        const data =
          Object.fromEntries(
            new FormData(form).entries()
          );

        /*
         * Source harus selalu dikontrol
         * oleh aplikasi, bukan input user.
         */

        data.source =
          "WEB_AM";

        /*
         * Validasi lokal.
         */

        const validationError =
          validateForm(data);

        if (validationError) {

          setFormStatus(
            validationError,
            "error"
          );

          return;
        }

        /*
         * Endpoint harus tersedia.
         *
         * Jika kosong, jangan pura-pura berhasil.
         */

        if (!INTAKE_ENDPOINT) {

          setFormStatus(
            "Endpoint intake belum dikonfigurasi. Data belum dikirim.",
            "info"
          );

          return;
        }

        if (submitButton) {

          submitButton.disabled =
            true;

          submitButton.textContent =
            "Mengirim...";

        }

        setFormStatus(
          "Sedang mengirim informasi...",
          "info"
        );

        try {

          const response =
            await fetch(
              INTAKE_ENDPOINT,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",

                  "Accept":
                    "application/json"
                },

                body:
                  JSON.stringify(data)
              }
            );

          /*
           * Backend harus memberikan
           * HTTP 2xx untuk dianggap berhasil.
           */

          if (!response.ok) {

            throw new Error(
              `HTTP ${response.status}`
            );

          }

          /*
           * Coba membaca JSON response.
           *
           * Tidak menjadikan parsing JSON
           * sebagai syarat utama keberhasilan,
           * karena HTTP 2xx sudah menunjukkan
           * request diterima server.
           */

          let result = null;

          try {

            result =
              await response.json();

          } catch (parseError) {

            /*
             * Response bukan JSON.
             * Tidak fatal jika HTTP sudah 2xx.
             */

            result = null;

          }

          /*
           * Sukses nyata dari backend.
           */

          form.reset();

          setFormStatus(
            "Terima kasih. Informasi Anda sudah diterima AUTO MARKETING.",
            "success"
          );

          /*
           * Diagnostic ringan untuk developer.
           * Tidak mengganggu user.
           */

          if (result) {

            console.info(
              "WEB AM INTAKE SUCCESS:",
              result
            );

          }

        } catch (error) {

          /*
           * Diagnostic terlihat di browser console.
           * Tidak menampilkan detail teknis
           * kepada pengunjung.
           */

          console.error(
            "WEB AM INTAKE ERROR:",
            error
          );

          setFormStatus(
            "Informasi belum berhasil dikirim. Periksa koneksi ke Central Backend atau hubungi AUTO MARKETING melalui WhatsApp.",
            "error"
          );

        } finally {

          if (submitButton) {

            submitButton.disabled =
              false;

            submitButton.textContent =
              "Kirim Informasi ke AUTO MARKETING";

          }

        }

      }
    );

  }

  /* =========================================
     INITIAL HASH
  ========================================= */

  function handleInitialHash() {

    const hash =
      window.location.hash;

    if (!hash) {
      return;
    }

    const target =
      document.querySelector(hash);

    if (!target) {
      return;
    }

    /*
     * Beri waktu browser menyelesaikan layout
     * sebelum scroll.
     */

    window.setTimeout(
      () => {

        target.scrollIntoView({
          behavior: "auto",
          block: "start"
        });

      },
      50
    );

  }

  handleInitialHash();

})();