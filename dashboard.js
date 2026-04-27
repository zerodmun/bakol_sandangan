(function () {
  var ADMIN_USERNAME = "admin";
  var ADMIN_PASSWORD = "admin123";
  var AUTH_KEY = "threadline-dashboard-auth";

  document.addEventListener("DOMContentLoaded", initDashboard);

  function initDashboard() {
    var storeTools;
    var store;
    var pendingLogo;
    var pendingHeroImage;

    var loginScreen = document.getElementById("login-screen");
    var loginForm = document.getElementById("login-form");
    var loginError = document.getElementById("login-error");
    var passwordInput = document.getElementById("password-input");
    var passwordToggle = document.getElementById("password-toggle");
    var toastContainer = document.getElementById("toast-container");
    var dashboardHeader = document.getElementById("dashboard-header");
    var dashboardApp = document.getElementById("dashboard-app");
    var syncStatus = document.getElementById("sync-status");
    var previewSiteButton = document.getElementById("preview-site");
    var publishSiteButton = document.getElementById("publish-site");
    var ownerMenuButton = document.getElementById("owner-menu-button");
    var ownerMenu = document.getElementById("owner-menu");
    var logoutButton = document.getElementById("logout-button");
    var logoutDialog = document.getElementById("logout-dialog");
    var cancelLogoutButton = document.getElementById("cancel-logout");
    var confirmLogoutButton = document.getElementById("confirm-logout");
    var tabButtons = document.querySelectorAll("[data-tab]");
    var profilePanel = document.getElementById("profile-panel");
    var productsPanel = document.getElementById("products-panel");
    var profileSummary = document.getElementById("profile-summary");
    var profileSummaryList = document.getElementById("profile-summary-list");
    var editProfileButton = document.getElementById("edit-profile");
    var profileForm = document.getElementById("profile-form");
    var cancelProfileEditButton = document.getElementById("cancel-profile-edit");
    var productAdminLayout = document.querySelector(".product-admin-layout");
    var productForm = document.getElementById("product-form");
    var productFormTitle = document.getElementById("product-form-title");
    var cardImageIndexInput = document.getElementById("card-image-index");
    var cardImagePreview = document.getElementById("card-image-preview");
    var addProductButton = document.getElementById("add-product");
    var productSearch = document.getElementById("product-search");
    var cancelEditButton = document.getElementById("cancel-edit");
    var removeLogoButton = document.getElementById("remove-logo");
    var removeHeroImageButton = document.getElementById("remove-hero-image");
    var logoPreview = document.getElementById("logo-preview");
    var heroImagePreview = document.getElementById("hero-image-preview");
    var productImageList = document.getElementById("product-image-list");
    var addProductImageButton = document.getElementById("add-product-image");
    var adminProductList = document.getElementById("admin-product-list");
    var productCount = document.getElementById("product-count");
    var pendingProductImages = [];
    var productSearchTerm = "";
    var recentlyEditedProductId = "";
    var editingProductId = "";

    bindLoginEvents();

    if (!window.StoreData) {
      showToast("File store.js belum terbaca. Jalankan lewat Live Server dan refresh halaman.");
      return;
    }

    storeTools = window.StoreData;
    store = storeTools.loadStore();
    if (storeTools.ensurePublishedStore) {
      storeTools.ensurePublishedStore(store);
    }
    pendingLogo = store.profile.logo || "";
    pendingHeroImage = store.profile.heroImage || "assets/kaos-collection.png";

    bindDashboardEvents();
    fillProfileForm();
    resetProductForm();
    syncDashboard(false);
    loadLatestStore();

    if (isLoggedIn()) {
      showDashboard();
    } else {
      showLogin();
    }

    function isLoggedIn() {
      try {
        return sessionStorage.getItem(AUTH_KEY) === "true";
      } catch (error) {
        return false;
      }
    }

    function showDashboard() {
      loginScreen.classList.add("is-hidden");
      dashboardHeader.classList.remove("is-hidden");
      dashboardApp.classList.remove("is-hidden");
    }

    function showLogin() {
      loginScreen.classList.remove("is-hidden");
      dashboardHeader.classList.add("is-hidden");
      dashboardApp.classList.add("is-hidden");
      logoutDialog.classList.add("is-hidden");
      ownerMenu.classList.add("is-hidden");
    }

    function showToast(message) {
      var toast = document.createElement("div");
      toast.className = "toast";
      toast.textContent = message;
      toastContainer.appendChild(toast);

      window.setTimeout(function () {
        toast.classList.add("is-leaving");
      }, 2600);

      window.setTimeout(function () {
        toast.remove();
      }, 3100);
    }

    function readCompressedImage(file, callback) {
      var reader = new FileReader();

      reader.addEventListener("load", function () {
        var image = new Image();

        image.addEventListener("load", function () {
          var canvas = document.createElement("canvas");
          var maxSize = 900;
          var scale = Math.min(1, maxSize / Math.max(image.width, image.height));
          var width = Math.max(1, Math.round(image.width * scale));
          var height = Math.max(1, Math.round(image.height * scale));
          var context;

          canvas.width = width;
          canvas.height = height;
          context = canvas.getContext("2d");
          context.drawImage(image, 0, 0, width, height);
          callback(canvas.toDataURL("image/jpeg", 0.78));
        });

        image.src = reader.result;
      });

      reader.readAsDataURL(file);
    }

    function openLogoutDialog() {
      logoutDialog.classList.remove("is-hidden");
      ownerMenu.classList.add("is-hidden");
      ownerMenuButton.setAttribute("aria-expanded", "false");
    }

    function closeLogoutDialog() {
      logoutDialog.classList.add("is-hidden");
    }

    function doLogout() {
      try {
        sessionStorage.removeItem(AUTH_KEY);
      } catch (error) {
        showLogin();
        return;
      }

      showLogin();
    }

    function bindLoginEvents() {
      passwordToggle.addEventListener("click", function () {
        var isPasswordVisible = passwordInput.type === "text";

        passwordInput.type = isPasswordVisible ? "password" : "text";
        passwordToggle.classList.toggle("is-visible", !isPasswordVisible);
        passwordToggle.setAttribute(
          "aria-label",
          isPasswordVisible ? "Lihat password" : "Sembunyikan password"
        );
      });

      loginForm.addEventListener("submit", function (event) {
        var formData;
        var username;
        var password;
        var isUsernameWrong;
        var isPasswordWrong;
        var message;

        event.preventDefault();

        formData = new FormData(loginForm);
        username = String(formData.get("username") || "").trim();
        password = String(formData.get("password") || "");

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
          try {
            sessionStorage.setItem(AUTH_KEY, "true");
          } catch (error) {
            showToast("Login berhasil, tetapi sesi browser tidak bisa disimpan.");
          }

          loginError.textContent = "";
          loginForm.reset();
          showDashboard();
          return;
        }

        isUsernameWrong = username !== ADMIN_USERNAME;
        isPasswordWrong = password !== ADMIN_PASSWORD;
        message = "Username atau password salah.";

        if (isUsernameWrong && isPasswordWrong) {
          message = "Username dan password salah.";
        } else if (isUsernameWrong) {
          message = "Username salah.";
        } else if (isPasswordWrong) {
          message = "Password salah.";
        }

        loginError.textContent = message;
        showToast(message);
      });
    }

    function setActiveTab(tabName) {
      var index;

      for (index = 0; index < tabButtons.length; index += 1) {
        tabButtons[index].classList.toggle("is-active", tabButtons[index].getAttribute("data-tab") === tabName);
      }

      profilePanel.classList.toggle("is-active", tabName === "profile");
      productsPanel.classList.toggle("is-active", tabName === "products");
    }

    function updateDashboardBrand() {
      var brandName = document.querySelector(".dashboard-title");

      document.title = "Dashboard - " + store.profile.name;
      brandName.textContent = store.profile.name;
    }

    function renderProfileSummary() {
      var logoValue = store.profile.logo ? "Logo custom aktif" : "Inisial " + store.profile.initials;
      var heroImageValue = store.profile.heroImage && store.profile.heroImage !== "assets/kaos-collection.png" ? "Gambar utama custom aktif" : "Gambar default";
      var items = [
        ["Profile website", store.profile.profileEnabled === false ? "Dimatikan, website mulai dari katalog" : "Aktif", store.profile.profileEnabled !== false],
        ["Nama toko", store.profile.name],
        ["Judul website", store.profile.title, true],
        ["Logo", logoValue],
        ["Gambar halaman utama", heroImageValue],
        ["Eyebrow hero", store.profile.eyebrow],
        ["Judul hero", store.profile.headline],
        ["Deskripsi hero", store.profile.description],
        ["Judul katalog", store.profile.catalogTitle],
        ["Deskripsi katalog", store.profile.catalogText],
        ["WhatsApp utama", store.profile.phoneNumber],
        ["Banner promo", store.profile.promoEnabled ? store.profile.promoText : "Tidak ditampilkan", store.profile.promoEnabled],
        ["Cara order", store.profile.faqTitle],
      ];
      var html = "";
      var index;
      var status;

      for (index = 0; index < items.length; index += 1) {
        status = items[index].length > 2 ? (items[index][2] ? "Aktif" : "Off") : "";
        html +=
          '<article class="summary-item">' +
          "<span>" +
          storeTools.escapeHTML(items[index][0]) +
          "</span>" +
          "<strong>" +
          storeTools.escapeHTML(items[index][1]) +
          "</strong>" +
          (status ? "<em>" + storeTools.escapeHTML(status) + "</em>" : "") +
          "</article>";
      }

      profileSummaryList.innerHTML = html;
    }

    function showProfileView() {
      profileSummary.classList.remove("is-hidden");
      profileForm.classList.add("is-hidden");
    }

    function showProfileEdit() {
      fillProfileForm();
      profileSummary.classList.add("is-hidden");
      profileForm.classList.remove("is-hidden");
    }

    function updateLogoPreview() {
      if (pendingLogo) {
        logoPreview.innerHTML = '<img src="' + storeTools.escapeHTML(pendingLogo) + '" alt="Preview logo" />';
      } else {
        logoPreview.textContent = profileForm.elements.initials.value || store.profile.initials;
      }
    }

    function updateHeroImagePreview() {
      if (pendingHeroImage) {
        heroImagePreview.innerHTML = '<img src="' + storeTools.escapeHTML(pendingHeroImage) + '" alt="Preview gambar utama" />';
      } else {
        heroImagePreview.textContent = "Preview gambar utama";
      }
    }

    function fillProfileForm() {
      var key;

      for (key in store.profile) {
        if (
          Object.prototype.hasOwnProperty.call(store.profile, key) &&
          profileForm.elements[key] &&
          profileForm.elements[key].type !== "checkbox"
        ) {
          profileForm.elements[key].value = store.profile[key];
        }
      }

      profileForm.elements.promoEnabled.checked = store.profile.promoEnabled !== false;
      profileForm.elements.profileEnabled.checked = store.profile.profileEnabled !== false;
      pendingLogo = store.profile.logo || "";
      pendingHeroImage = store.profile.heroImage || "assets/kaos-collection.png";
      updateLogoPreview();
      updateHeroImagePreview();
    }

    function resetProductForm() {
      productForm.reset();
      pendingProductImages = [];
      productForm.elements.id.value = "";
      productForm.elements.category.value = "basic";
      productForm.elements.status.value = "ready";
      productForm.elements.isPublished.checked = true;
      fillSizeInputs({ S: 0, M: 0, L: 0, XL: 0, XXL: 0 });
      productForm.elements.shirt.value = "#171717";
      productForm.elements.text.value = "#ffffff";
      productForm.elements.whatsappUrl.value = storeTools.buildProductWhatsApp(
        { name: "Nama Produk", price: "Rp0" },
        store.profile.phoneNumber
      );
      productForm.elements.shopeeUrl.value = "https://shopee.co.id/";
      renderProductImageInputs();
      renderCardImageOptions(0);
      productFormTitle.textContent = "Tambah Produk";
    }

    function getProductImages(product) {
      if (product.images && product.images.length) {
        return product.images.slice(0, 7);
      }

      if (product.image) {
        return [product.image];
      }

      return [];
    }

    function renderProductImageInputs() {
      var html = "";
      var index;
      var image;
      var selectedCardIndex = Number(cardImageIndexInput.value) || 0;

      for (index = 0; index < pendingProductImages.length; index += 1) {
        image = pendingProductImages[index];
        html +=
          '<div class="image-row" data-index="' +
          index +
          '">' +
          '<div class="image-preview">' +
          (image ? '<img src="' + storeTools.escapeHTML(image) + '" alt="Gambar produk ' + (index + 1) + '" />' : "Kosong") +
          "</div>" +
          (index === selectedCardIndex ? '<span class="card-used-label">Dipakai di card</span>' : "") +
          '<input type="file" accept="image/*" data-image-input="' +
          index +
          '" />' +
          '<button class="mini-btn danger" type="button" data-remove-image="' +
          index +
          '">Hapus</button>' +
          "</div>";
      }

      productImageList.innerHTML = html || '<div class="admin-empty"><strong>Belum ada gambar</strong><span>Tambahkan minimal satu gambar produk.</span></div>';
      addProductImageButton.disabled = pendingProductImages.length >= 7;
      renderCardImageOptions(Number(cardImageIndexInput.value) || 0);
      updateCardImagePreview();
    }

    function renderCardImageOptions(selectedIndex) {
      var html = "";
      var index;

      if (!pendingProductImages.length) {
        cardImageIndexInput.innerHTML = '<option value="0">Gambar pertama</option>';
        return;
      }

      for (index = 0; index < pendingProductImages.length; index += 1) {
        html +=
          '<option value="' +
          index +
          '"' +
          (index === selectedIndex ? " selected" : "") +
          ">Gambar " +
          (index + 1) +
          "</option>";
      }

      cardImageIndexInput.innerHTML = html;
      updateCardImagePreview();
    }

    function updateCardImagePreview() {
      var selectedIndex = Number(cardImageIndexInput.value) || 0;
      var image = pendingProductImages[selectedIndex] || "";

      if (image) {
        cardImagePreview.innerHTML = '<img src="' + storeTools.escapeHTML(image) + '" alt="Preview gambar card" />';
      } else {
        cardImagePreview.textContent = "Preview card";
      }

      updateCardUsedLabels(selectedIndex);
    }

    function updateCardUsedLabels(selectedIndex) {
      var labels = productImageList.querySelectorAll(".card-used-label");
      var rows = productImageList.querySelectorAll(".image-row");
      var index;

      for (index = 0; index < labels.length; index += 1) {
        labels[index].parentNode.removeChild(labels[index]);
      }

      if (rows[selectedIndex]) {
        rows[selectedIndex].insertBefore(createCardUsedLabel(), rows[selectedIndex].children[1]);
      }
    }

    function createCardUsedLabel() {
      var label = document.createElement("span");
      label.className = "card-used-label";
      label.textContent = "Dipakai di card";
      return label;
    }

    function showProductForm(mode) {
      productFormTitle.textContent = mode || "Tambah Produk";
      productAdminLayout.classList.add("is-editing");
      productForm.classList.remove("is-hidden");
      productForm.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function hideProductForm() {
      productAdminLayout.classList.remove("is-editing");
      productForm.classList.add("is-hidden");
    }

    function renderAdminProducts() {
      var html = "";
      var index;
      var product;
      var visibleCount = 0;

      productCount.textContent = store.products.length + " produk";

      if (!store.products.length) {
        adminProductList.innerHTML =
          '<div class="admin-empty"><strong>Produk kosong</strong><span>Tambahkan produk pertama lewat form di sebelah kiri.</span></div>';
        return;
      }

      for (index = 0; index < store.products.length; index += 1) {
        product = store.products[index];

        if (!matchesProductSearch(product)) {
          continue;
        }

        visibleCount += 1;
        html +=
          '<article class="admin-product-item ' +
          (product.id === recentlyEditedProductId ? "is-recently-edited " : "") +
          (product.id === editingProductId ? "is-editing-product" : "") +
          '">' +
          '<span class="color-dot" style="background: ' +
          storeTools.escapeHTML(product.shirt) +
          '"></span>' +
          '<span class="admin-product-thumb">' +
          (getProductImages(product)[0]
            ? '<img src="' + storeTools.escapeHTML(getProductImages(product)[0]) + '" alt="' + storeTools.escapeHTML(product.name) + '" />'
            : "") +
          "</span>" +
          "<div><strong>" +
          storeTools.escapeHTML(product.name) +
          "</strong><span>" +
          storeTools.escapeHTML(product.price) +
          " / " +
          storeTools.escapeHTML(product.category) +
          " / " +
          storeTools.escapeHTML(formatStatus(product.status)) +
          " / " +
          storeTools.escapeHTML(getSizeSummary(product)) +
          "</span>" +
          (product.isPublished === false ? '<em class="draft-label">Draft</em>' : "") +
          (product.id === recentlyEditedProductId ? '<em class="recent-label">Baru diedit</em>' : "") +
          (product.id === editingProductId ? '<em class="editing-label">Sedang diedit</em>' : "") +
          (product.editedAt ? '<em class="time-label">Diedit ' + storeTools.escapeHTML(product.editedAt) + '</em>' : "") +
          "</div>" +
          '<div class="admin-actions">' +
          '<a class="mini-btn" href="' +
          storeTools.escapeHTML(product.whatsappUrl) +
          '" target="_blank" rel="noreferrer">WA</a>' +
          '<a class="mini-btn" href="' +
          storeTools.escapeHTML(product.shopeeUrl) +
          '" target="_blank" rel="noreferrer">Shopee</a>' +
          '<button class="mini-btn" type="button" data-action="edit" data-id="' +
          storeTools.escapeHTML(product.id) +
          '">Edit</button>' +
          '<button class="mini-btn danger" type="button" data-action="delete" data-id="' +
          storeTools.escapeHTML(product.id) +
          '">Hapus</button>' +
          "</div>" +
          renderAdminComments(product) +
          "</article>";
      }

      if (!visibleCount) {
        adminProductList.innerHTML =
          '<div class="admin-empty"><strong>Produk tidak ditemukan</strong><span>Coba kata kunci lain.</span></div>';
        return;
      }

      adminProductList.innerHTML = html;
      productCount.textContent = visibleCount + " dari " + store.products.length + " produk";
    }

    function matchesProductSearch(product) {
      var keyword = productSearchTerm.toLowerCase();
      var haystack;

      if (!keyword) {
        return true;
      }

      haystack = [
        product.name,
        product.price,
        product.category,
        product.status,
        getSizeSummary(product),
        product.description,
      ].join(" ").toLowerCase();

      return haystack.indexOf(keyword) !== -1;
    }

    function formatStatus(status) {
      if (status === "soldout") {
        return "Stok Habis";
      }

      if (status === "preorder") {
        return "Pre-order 3-7 hari";
      }

      return "Ready Stock";
    }

    function renderAdminComments(product) {
      var comments = product.comments || [];
      var html = '<div class="admin-comments"><strong>Komentar Pembeli</strong>';
      var commentIndex;
      var comment;

      if (!comments.length) {
        return html + '<span>Belum ada komentar.</span></div>';
      }

      for (commentIndex = 0; commentIndex < comments.length; commentIndex += 1) {
        comment = comments[commentIndex];
        html +=
          '<div class="admin-comment-item"><div><strong>' +
          storeTools.escapeHTML(comment.name || "Pembeli") +
          "</strong><p>" +
          storeTools.escapeHTML(comment.text || "") +
          '</p></div><button class="mini-btn danger" type="button" data-action="delete-comment" data-id="' +
          storeTools.escapeHTML(product.id) +
          '" data-comment-index="' +
          commentIndex +
          '">Hapus</button></div>';
      }

      return html + "</div>";
    }

    function getProductSizes(product) {
      if (storeTools.normalizeSizes) {
        return storeTools.normalizeSizes(product.sizes);
      }

      return product.sizes || { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
    }

    function getSizeSummary(product) {
      var total;

      if (storeTools.getProductStock) {
        total = storeTools.getProductStock(product);
      } else {
        total = 0;
      }

      return "Stok " + total + " pcs";
    }

    function collectSizeInputs(formData) {
      return {
        S: Number(formData.get("sizeS")) || 0,
        M: Number(formData.get("sizeM")) || 0,
        L: Number(formData.get("sizeL")) || 0,
        XL: Number(formData.get("sizeXL")) || 0,
        XXL: Number(formData.get("sizeXXL")) || 0,
      };
    }

    function fillSizeInputs(sizes) {
      var normalizedSizes = storeTools.normalizeSizes ? storeTools.normalizeSizes(sizes) : sizes;

      productForm.elements.sizeS.value = normalizedSizes.S || 0;
      productForm.elements.sizeM.value = normalizedSizes.M || 0;
      productForm.elements.sizeL.value = normalizedSizes.L || 0;
      productForm.elements.sizeXL.value = normalizedSizes.XL || 0;
      productForm.elements.sizeXXL.value = normalizedSizes.XXL || 0;
    }

    function syncDashboard(shouldSave) {
      if (shouldSave !== false) {
        updateSyncStatus(
          "saving",
          "Menyimpan draft",
          "Perubahan belum tampil di website pembeli"
        );
        if (
          !storeTools.saveStore(
            store,
            function () {
              updateSyncStatus(
                "saved",
                "Draft tersimpan",
                "Klik Publish saat siap ditampilkan"
              );
            },
            function (error) {
              updateSyncStatus("error", "Gagal sync", error.message);
              showToast("Data cloud gagal disimpan: " + error.message);
            }
          )
        ) {
          updateSyncStatus("error", "Gagal lokal", "Browser tidak bisa menyimpan data");
          showToast("Data gagal disimpan. Kurangi ukuran/jumlah gambar produk.");
          return false;
        }
      } else {
        updateSyncStatus("idle", "Siap diedit", "Mode draft aktif");
      }

      updateDashboardBrand();
      renderProfileSummary();
      renderAdminProducts();
      return true;
    }

    function publishDashboard() {
      if (!profileForm.classList.contains("is-hidden") || !productForm.classList.contains("is-hidden")) {
        showToast("Simpan atau batalkan form dulu sebelum Publish.");
        return false;
      }

      updateSyncStatus(
        "saving",
        "Publish",
        storeTools.isCloudStoreEnabled && storeTools.isCloudStoreEnabled()
          ? "Mengirim data ke website online"
          : "Menampilkan data di browser ini"
      );

      if (
        !storeTools.savePublishedStore(
          store,
          function () {
            updateSyncStatus(
              "saved",
              storeTools.isCloudStoreEnabled && storeTools.isCloudStoreEnabled()
                ? "Published online"
                : "Published lokal",
              "Website pembeli sudah memakai data ini"
            );
            showToast("Website berhasil dipublish.");
          },
          function (error) {
            updateSyncStatus("error", "Publish gagal", error.message);
            showToast("Publish cloud gagal: " + error.message);
          }
        )
      ) {
        updateSyncStatus("error", "Publish gagal", "Browser tidak bisa menyimpan data");
        showToast("Publish gagal. Kurangi ukuran/jumlah gambar produk.");
        return false;
      }

      return true;
    }

    function updateSyncStatus(type, title, detail) {
      if (!syncStatus) {
        return;
      }

      syncStatus.className = "sync-status is-" + type;
      syncStatus.innerHTML =
        '<span class="sync-dot"></span><strong>' +
        storeTools.escapeHTML(title) +
        "</strong><small>" +
        storeTools.escapeHTML(detail) +
        "</small>";
    }

    function loadLatestStore() {
      if (!storeTools.loadCloudStore) {
        return false;
      }

      if (storeTools.hasDraftStore && storeTools.hasDraftStore()) {
        updateSyncStatus("idle", "Draft lokal aktif", "Klik Publish untuk menampilkan");
        return false;
      }

      return storeTools.loadCloudStore(
        function (remoteStore) {
          if (!remoteStore.products.length && store.products.length) {
            storeTools.saveStore(store, function () {
              updateSyncStatus("saved", "Draft dibuat", "Klik Publish untuk menampilkan");
              showToast("Draft siap dipublish.");
            });
            return;
          }

          store = remoteStore;
          storeTools.saveStore(store);
          pendingLogo = store.profile.logo || "";
          pendingHeroImage = store.profile.heroImage || "assets/kaos-collection.png";
          fillProfileForm();
          resetProductForm();
          hideProductForm();
          syncDashboard(false);
          updateSyncStatus("saved", "Draft dari cloud", "Klik Publish jika ada perubahan");
          showToast("Data cloud dimuat sebagai draft.");
        },
        function (error) {
          updateSyncStatus("error", "Cloud belum terbaca", error.message);
          showToast("Data cloud belum bisa dimuat: " + error.message);
        }
      );
    }

    function getProductById(productId) {
      var index;

      for (index = 0; index < store.products.length; index += 1) {
        if (store.products[index].id === productId) {
          return store.products[index];
        }
      }

      return null;
    }

    function closestButton(element) {
      while (element && element !== adminProductList) {
        if (element.tagName === "BUTTON") {
          return element;
        }

        element = element.parentNode;
      }

      return null;
    }

    function bindDashboardEvents() {
      var index;

      previewSiteButton.addEventListener("click", function () {
        window.open("index.html?preview=draft", "_blank");
      });

      publishSiteButton.addEventListener("click", function () {
        publishDashboard();
      });

      ownerMenuButton.addEventListener("click", function () {
        var isOpen = ownerMenu.classList.toggle("is-hidden") === false;
        ownerMenuButton.setAttribute("aria-expanded", String(isOpen));
      });

      logoutButton.addEventListener("click", function () {
        openLogoutDialog();
      });

      cancelLogoutButton.addEventListener("click", function () {
        closeLogoutDialog();
      });

      confirmLogoutButton.addEventListener("click", function () {
        closeLogoutDialog();
        doLogout();
      });

      logoutDialog.addEventListener("click", function (event) {
        if (event.target === logoutDialog) {
          closeLogoutDialog();
        }
      });

      for (index = 0; index < tabButtons.length; index += 1) {
        tabButtons[index].addEventListener("click", function () {
          setActiveTab(this.getAttribute("data-tab"));
        });
      }

      editProfileButton.addEventListener("click", showProfileEdit);

      cancelProfileEditButton.addEventListener("click", function () {
        pendingLogo = store.profile.logo || "";
        pendingHeroImage = store.profile.heroImage || "assets/kaos-collection.png";
        fillProfileForm();
        showProfileView();
      });

      profileForm.elements.initials.addEventListener("input", updateLogoPreview);

      profileForm.elements.logoFile.addEventListener("change", function (event) {
        var file = event.target.files[0];

        if (!file) {
          return;
        }

        readCompressedImage(file, function (imageData) {
          pendingLogo = imageData;
          updateLogoPreview();
        });
      });

      removeLogoButton.addEventListener("click", function () {
        pendingLogo = "";
        profileForm.elements.logoFile.value = "";
        updateLogoPreview();
      });

      profileForm.elements.heroImageFile.addEventListener("change", function (event) {
        var file = event.target.files[0];

        if (!file) {
          return;
        }

        readCompressedImage(file, function (imageData) {
          pendingHeroImage = imageData;
          updateHeroImagePreview();
        });
      });

      removeHeroImageButton.addEventListener("click", function () {
        pendingHeroImage = "assets/kaos-collection.png";
        profileForm.elements.heroImageFile.value = "";
        updateHeroImagePreview();
      });

      addProductImageButton.addEventListener("click", function () {
        if (pendingProductImages.length >= 7) {
          showToast("Maksimal 7 gambar produk.");
          return;
        }

        pendingProductImages.push("");
        renderProductImageInputs();
      });

      cardImageIndexInput.addEventListener("change", updateCardImagePreview);

      productImageList.addEventListener("change", function (event) {
        var file = event.target.files[0];
        var imageIndex = Number(event.target.getAttribute("data-image-input"));

        if (!file || isNaN(imageIndex)) {
          return;
        }

        readCompressedImage(file, function (imageData) {
          pendingProductImages[imageIndex] = imageData;
          renderProductImageInputs();
        });
      });

      productImageList.addEventListener("click", function (event) {
        var button = event.target;
        var imageIndex;

        if (!button || !button.getAttribute("data-remove-image")) {
          return;
        }

        imageIndex = Number(button.getAttribute("data-remove-image"));
        pendingProductImages.splice(imageIndex, 1);
        renderProductImageInputs();
      });

      profileForm.addEventListener("submit", function (event) {
        var formData;

        event.preventDefault();
        formData = new FormData(profileForm);

        store.profile.name = String(formData.get("name") || "").trim();
        store.profile.title = String(formData.get("title") || "").trim();
        store.profile.initials = String(formData.get("initials") || "").trim().toUpperCase();
        store.profile.logo = pendingLogo;
        store.profile.heroImage = pendingHeroImage || "assets/kaos-collection.png";
        store.profile.eyebrow = String(formData.get("eyebrow") || "").trim();
        store.profile.headline = String(formData.get("headline") || "").trim();
        store.profile.description = String(formData.get("description") || "").trim();
        store.profile.catalogTitle = String(formData.get("catalogTitle") || "").trim();
        store.profile.catalogText = String(formData.get("catalogText") || "").trim();
        store.profile.phoneNumber = String(formData.get("phoneNumber") || "").replace(/[^\d]/g, "");
        store.profile.promoEnabled = formData.get("promoEnabled") === "on";
        store.profile.promoText = String(formData.get("promoText") || "").trim();
        store.profile.faqTitle = String(formData.get("faqTitle") || "").trim();
        store.profile.faqText = String(formData.get("faqText") || "").trim();
        store.profile.profileEnabled = formData.get("profileEnabled") === "on";

        if (syncDashboard()) {
          fillProfileForm();
          showProfileView();
        }
      });

      addProductButton.addEventListener("click", function () {
        editingProductId = "";
        resetProductForm();
        renderAdminProducts();
        showProductForm("Tambah Produk");
      });

      productSearch.addEventListener("input", function () {
        productSearchTerm = productSearch.value.trim();
        renderAdminProducts();
      });

      productForm.addEventListener("submit", function (event) {
        var formData;
        var productId;
        var existingProduct;
        var product;
        var nextProducts = [];
        var found = false;
        var productIndex;

        event.preventDefault();
        formData = new FormData(productForm);
        productId = String(formData.get("id") || "");
        existingProduct = getProductById(productId);
        product = {
          id: productId || storeTools.createProductId(),
          name: String(formData.get("name") || "").trim(),
          price: String(formData.get("price") || "").trim(),
          category: String(formData.get("category") || "basic"),
          status: String(formData.get("status") || "ready"),
          isPublished: formData.get("isPublished") === "on",
          sizes: collectSizeInputs(formData),
          description: String(formData.get("description") || "").trim(),
          whatsappUrl: String(formData.get("whatsappUrl") || "").trim(),
          shopeeUrl: String(formData.get("shopeeUrl") || "").trim(),
          shirt: String(formData.get("shirt") || "#171717"),
          text: String(formData.get("text") || "#ffffff"),
          images: pendingProductImages.filter(function (image) {
            return image;
          }).slice(0, 7),
          cardImageIndex: Number(formData.get("cardImageIndex")) || 0,
          image:
            pendingProductImages[Number(formData.get("cardImageIndex")) || 0] ||
            pendingProductImages[0] ||
            "",
          comments: existingProduct && existingProduct.comments ? existingProduct.comments : [],
          createdAt: existingProduct && existingProduct.createdAt ? existingProduct.createdAt : new Date().toISOString(),
          editedAt: getEditTime(),
          gradient: existingProduct ? existingProduct.gradient : ["#e7e1d7", "#ffffff"],
        };

        if (productId) {
          for (productIndex = 0; productIndex < store.products.length; productIndex += 1) {
            if (store.products[productIndex].id === productId) {
              nextProducts.push(product);
              found = true;
            } else {
              nextProducts.push(store.products[productIndex]);
            }
          }

          store.products = found ? nextProducts : store.products;
        } else {
          store.products.unshift(product);
        }

        if (syncDashboard()) {
          recentlyEditedProductId = productId || product.id;
          editingProductId = "";
          renderAdminProducts();
          resetProductForm();
          hideProductForm();
          showToast(productId ? "Anda berhasil edit produk." : "Anda berhasil tambah produk.");
        }
      });

      adminProductList.addEventListener("click", function (event) {
        var button = closestButton(event.target);
        var productId;
        var product;
        var confirmed;

        if (!button) {
          return;
        }

        productId = button.getAttribute("data-id");
        product = getProductById(productId);

        if (!product) {
          return;
        }

        if (button.getAttribute("data-action") === "edit") {
          editingProductId = product.id;
          productForm.elements.id.value = product.id;
          productForm.elements.name.value = product.name;
          productForm.elements.price.value = product.price;
          productForm.elements.category.value = product.category;
          productForm.elements.status.value = product.status || "ready";
          productForm.elements.isPublished.checked = product.isPublished !== false;
          fillSizeInputs(product.sizes);
          productForm.elements.description.value = product.description;
          productForm.elements.whatsappUrl.value = product.whatsappUrl;
          productForm.elements.shopeeUrl.value = product.shopeeUrl;
          productForm.elements.shirt.value = product.shirt;
          productForm.elements.text.value = product.text;
          pendingProductImages = getProductImages(product);
          renderProductImageInputs();
          renderCardImageOptions(Number(product.cardImageIndex) || 0);
          renderAdminProducts();
          setActiveTab("products");
          showProductForm("Edit Produk");
        }

        if (button.getAttribute("data-action") === "delete") {
          confirmed = confirm('Hapus produk "' + product.name + '"?');

          if (confirmed) {
            store.products = store.products.filter(function (item) {
              return item.id !== productId;
            });
            resetProductForm();
            hideProductForm();
            syncDashboard();
          }
        }

        if (button.getAttribute("data-action") === "delete-comment") {
          product.comments = product.comments || [];
          product.comments.splice(Number(button.getAttribute("data-comment-index")), 1);
          syncDashboard();
          showToast("Komentar berhasil dihapus.");
        }
      });

      cancelEditButton.addEventListener("click", function () {
        editingProductId = "";
        resetProductForm();
        hideProductForm();
        renderAdminProducts();
      });

    }

    function getEditTime() {
      var now = new Date();
      var hours = padTwo(now.getHours());
      var minutes = padTwo(now.getMinutes());

      return hours + ":" + minutes;
    }

    function padTwo(value) {
      return value < 10 ? "0" + value : String(value);
    }
  }
})();
