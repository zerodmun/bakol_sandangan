(function () {
  document.addEventListener("DOMContentLoaded", initWebsite);

  function initWebsite() {
    var storeTools = window.StoreData;
    var store = storeTools.loadStore();
    var siteToast = document.getElementById("site-toast");
    var activeCategory = "all";
    var productGrid = document.getElementById("product-grid");
    var filterButtons = document.querySelectorAll(".filter-btn");
    var navToggle = document.querySelector(".nav-toggle");
    var navLinks = document.getElementById("nav-links");
    var detailSection = document.getElementById("product-detail");
    var backToProducts = document.getElementById("back-to-products");
    var detailImage = document.getElementById("detail-image");
    var detailThumbs = document.getElementById("detail-thumbs");
    var detailCategory = document.getElementById("detail-category");
    var detailName = document.getElementById("detail-name");
    var detailPrice = document.getElementById("detail-price");
    var detailStatus = document.getElementById("detail-status");
    var detailSizes = document.getElementById("detail-sizes");
    var detailDescription = document.getElementById("detail-description");
    var commentForm = document.getElementById("comment-form");
    var commentTitle = document.getElementById("comment-title");
    var commentText = document.getElementById("comment-text");
    var commentCounter = document.getElementById("comment-counter");
    var commentList = document.getElementById("comment-list");
    var commentToggle = document.getElementById("comment-toggle");
    var detailWhatsapp = document.getElementById("detail-whatsapp");
    var detailShopee = document.getElementById("detail-shopee");
    var prevImage = document.getElementById("prev-image");
    var nextImage = document.getElementById("next-image");
    var selectedProduct = null;
    var selectedImageIndex = 0;
    var showAllComments = false;
    var index;

    storeTools.saveStore(store);
    applyProfile();
    renderProducts(activeCategory);

    window.addEventListener("storage", function () {
      refreshStore();
    });

    window.addEventListener("focus", function () {
      refreshStore();
    });

    for (index = 0; index < filterButtons.length; index += 1) {
      filterButtons[index].addEventListener("click", function () {
        var buttonIndex;

        for (buttonIndex = 0; buttonIndex < filterButtons.length; buttonIndex += 1) {
          filterButtons[buttonIndex].classList.remove("is-active");
        }

        this.classList.add("is-active");
        renderProducts(this.getAttribute("data-filter"));
      });
    }

    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });

    productGrid.addEventListener("click", function (event) {
      var button = closestButton(event.target);
      var productId;
      var product;

      if (!button || button.getAttribute("data-action") !== "detail") {
        return;
      }

      productId = button.getAttribute("data-id");
      product = getProductById(productId);

      if (product) {
        showProductDetail(product);
      }
    });

    backToProducts.addEventListener("click", function () {
      closeProductDetail();
    });

    detailSection.addEventListener("click", function (event) {
      if (event.target === detailSection) {
        closeProductDetail();
      }
    });

    prevImage.addEventListener("click", function () {
      moveSlide(-1);
    });

    nextImage.addEventListener("click", function () {
      moveSlide(1);
    });

    detailThumbs.addEventListener("click", function (event) {
      var button = closestButton(event.target);

      if (!button) {
        return;
      }

      selectedImageIndex = Number(button.getAttribute("data-image-index"));
      renderDetailImage();
    });

    commentForm.addEventListener("submit", function (event) {
      var formData;
      var comment;

      event.preventDefault();

      if (!selectedProduct) {
        return;
      }

      formData = new FormData(commentForm);
      comment = {
        name: String(formData.get("commentName") || "").trim(),
        text: String(formData.get("commentText") || "").trim().slice(0, 180),
        date: new Date().toLocaleDateString("id-ID"),
      };

      if (!comment.name || !comment.text) {
        return;
      }

      if (!selectedProduct.comments) {
        selectedProduct.comments = [];
      }

      selectedProduct.comments.unshift(comment);
      updateProductInStore(selectedProduct);
      storeTools.saveStore(store);
      commentForm.reset();
      updateCommentCounter();
      renderComments(selectedProduct);
      showSiteToast("Komentar berhasil dikirim.");
    });

    commentText.addEventListener("input", updateCommentCounter);

    commentToggle.addEventListener("click", function () {
      showAllComments = !showAllComments;
      renderComments(selectedProduct);
    });

    function getGradient(product) {
      return product.gradient || ["#e7e1d7", "#ffffff"];
    }

    function refreshStore() {
      var previousCount = store.products.length;
      store = storeTools.loadStore();
      applyProfile();
      renderProducts(activeCategory);

      if (selectedProduct) {
        selectedProduct = getProductById(selectedProduct.id);

        if (selectedProduct) {
          showProductDetail(selectedProduct);
        } else if (previousCount !== store.products.length) {
          closeProductDetail();
        }
      }
    }

    function closestButton(element) {
      while (element && element !== document) {
        if (element.tagName === "BUTTON") {
          return element;
        }

        element = element.parentNode;
      }

      return null;
    }

    function getProductById(productId) {
      var productIndex;

      for (productIndex = 0; productIndex < store.products.length; productIndex += 1) {
        if (store.products[productIndex].id === productId) {
          return store.products[productIndex];
        }
      }

      return null;
    }

    function updateProductInStore(updatedProduct) {
      var productIndex;

      for (productIndex = 0; productIndex < store.products.length; productIndex += 1) {
        if (store.products[productIndex].id === updatedProduct.id) {
          store.products[productIndex] = updatedProduct;
          return;
        }
      }
    }

    function getProductImages(product) {
      if (product.images && product.images.length) {
        return product.images.slice(0, 7);
      }

      if (product.image) {
        return [product.image];
      }

      return ["assets/kaos-collection.png"];
    }

    function applyProfile() {
      var brandMark = document.querySelector(".brand-mark");
      var brandName = document.querySelector(".brand span:last-child");
      var heroImage = document.getElementById("hero-image");
      var storeElements = document.querySelectorAll("[data-store]");
      var elementIndex;
      var key;

      document.title = store.profile.title || store.profile.name;

      if (store.profile.logo) {
        brandMark.innerHTML =
          '<img src="' +
          storeTools.escapeHTML(store.profile.logo) +
          '" alt="' +
          storeTools.escapeHTML(store.profile.name) +
          ' logo" />';
      } else {
        brandMark.textContent = store.profile.initials;
      }

      brandName.textContent = store.profile.name;
      heroImage.src = store.profile.heroImage || "assets/kaos-collection.png";
      heroImage.alt = "Gambar utama " + store.profile.name;

      for (elementIndex = 0; elementIndex < storeElements.length; elementIndex += 1) {
        key = storeElements[elementIndex].getAttribute("data-store");
        storeElements[elementIndex].textContent = store.profile[key] || "";
      }
    }

    function renderProductVisual(product) {
      var images = getProductImages(product);
      var cardImageIndex = Number(product.cardImageIndex) || 0;
      var cardImage = images[cardImageIndex] || images[0];

      if (cardImage) {
        return '<img src="' + storeTools.escapeHTML(cardImage) + '" alt="' + storeTools.escapeHTML(product.name) + '" />';
      }

      return '<div class="shirt" aria-hidden="true">' + storeTools.escapeHTML(store.profile.initials) + "</div>";
    }

    function renderProducts(category) {
      var visibleProducts = [];
      var product;
      var gradient;
      var html = "";
      var productIndex;

      activeCategory = category || activeCategory;

      for (productIndex = 0; productIndex < store.products.length; productIndex += 1) {
        product = store.products[productIndex];

        if (activeCategory === "all" || product.category === activeCategory) {
          visibleProducts.push(product);
        }
      }

      if (!visibleProducts.length) {
        productGrid.innerHTML =
          '<div class="empty-state"><h3>Belum ada produk</h3><p>Produk yang ditambahkan dari dashboard akan tampil di sini.</p></div>';
        return;
      }

      for (productIndex = 0; productIndex < visibleProducts.length; productIndex += 1) {
        product = visibleProducts[productIndex];
        gradient = getGradient(product);

        html +=
          '<article class="product-card">' +
          '<div class="product-visual" style="--card-a: ' +
          storeTools.escapeHTML(gradient[0]) +
          "; --card-b: " +
          storeTools.escapeHTML(gradient[1]) +
          "; --shirt: " +
          storeTools.escapeHTML(product.shirt) +
          "; --shirt-text: " +
          storeTools.escapeHTML(product.text) +
          ';">' +
          renderProductVisual(product) +
          "</div>" +
          '<div class="product-body">' +
          '<div class="product-top"><h3>' +
          storeTools.escapeHTML(product.name) +
          "</h3><span>" +
          storeTools.escapeHTML(product.price) +
          "</span></div>" +
          '<div class="status-badge ' +
          storeTools.escapeHTML(product.status || "ready") +
          '">' +
          storeTools.escapeHTML(formatStatus(product.status)) +
          "</div>" +
          "<p>" +
          storeTools.escapeHTML(product.description) +
          "</p>" +
          '<button class="btn btn-primary" type="button" data-action="detail" data-id="' +
          storeTools.escapeHTML(product.id) +
          '">Detail Produk</button>' +
          "</div>" +
          "</article>";
      }

      productGrid.innerHTML = html;
    }

    function showProductDetail(product) {
      selectedProduct = product;
      selectedImageIndex = 0;
      showAllComments = false;
      detailCategory.textContent = product.category;
      detailName.textContent = product.name;
      detailPrice.textContent = product.price;
      detailStatus.textContent = formatStatus(product.status);
      detailStatus.className = "status-badge " + (product.status || "ready");
      renderDetailSizes(product);
      detailDescription.textContent = product.description;
      detailWhatsapp.href = product.whatsappUrl;
      detailShopee.href = product.shopeeUrl;
      detailWhatsapp.classList.toggle("is-disabled", product.status === "soldout");
      detailShopee.classList.toggle("is-disabled", product.status === "soldout");
      if (product.status === "soldout") {
        detailWhatsapp.removeAttribute("href");
        detailShopee.removeAttribute("href");
      }
      renderDetailImage();
      renderComments(product);
      detailSection.classList.remove("is-hidden");
      document.body.style.overflow = "hidden";
    }

    function renderComments(product) {
      var comments = product.comments || [];
      var visibleComments = showAllComments ? comments : comments.slice(0, 3);
      var html = "";
      var commentIndex;
      var comment;

      if (!comments.length) {
        commentTitle.textContent = "Komentar Pembeli (0)";
        commentList.innerHTML = '<div class="comment-item"><p>Belum ada komentar pembeli.</p></div>';
        commentToggle.classList.add("is-hidden");
        return;
      }

      commentTitle.textContent = "Komentar Pembeli (" + comments.length + ")";

      for (commentIndex = 0; commentIndex < visibleComments.length; commentIndex += 1) {
        comment = visibleComments[commentIndex];
        html +=
          '<article class="comment-item"><strong>' +
          storeTools.escapeHTML(comment.name || "Pembeli") +
          "</strong><p>" +
          storeTools.escapeHTML(comment.text || "") +
          "</p></article>";
      }

      commentList.innerHTML = html;
      commentToggle.classList.toggle("is-hidden", comments.length <= 3);
      commentToggle.textContent = showAllComments ? "Sembunyikan komentar" : "Lihat semua komentar";
    }

    function renderDetailSizes(product) {
      var sizes = storeTools.normalizeSizes ? storeTools.normalizeSizes(product.sizes) : product.sizes || {};
      var labels = ["S", "M", "L", "XL", "XXL"];
      var html = '<strong>Stok ukuran</strong><div>';
      var index;
      var label;
      var stock;

      for (index = 0; index < labels.length; index += 1) {
        label = labels[index];
        stock = Number(sizes[label]) || 0;
        html +=
          '<span class="size-chip ' +
          (stock ? "" : "is-empty") +
          '"><b>' +
          label +
          "</b>" +
          (stock ? stock + " pcs" : "Habis") +
          "</span>";
      }

      detailSizes.innerHTML = html + "</div>";
    }

    function updateCommentCounter() {
      commentCounter.textContent = commentText.value.length + "/180";
    }

    function showSiteToast(message) {
      siteToast.textContent = message;
      siteToast.classList.remove("is-hidden");

      window.setTimeout(function () {
        siteToast.classList.add("is-hidden");
      }, 2200);
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

    function closeProductDetail() {
      detailSection.classList.add("is-hidden");
      document.body.style.overflow = "";
    }

    function renderDetailImage() {
      var images = getProductImages(selectedProduct);
      var html = "";
      var imageIndex;

      if (selectedImageIndex < 0) {
        selectedImageIndex = images.length - 1;
      }

      if (selectedImageIndex >= images.length) {
        selectedImageIndex = 0;
      }

      detailImage.src = images[selectedImageIndex];
      detailImage.alt = selectedProduct.name;

      for (imageIndex = 0; imageIndex < images.length; imageIndex += 1) {
        html +=
          '<button type="button" class="' +
          (imageIndex === selectedImageIndex ? "is-active" : "") +
          '" data-image-index="' +
          imageIndex +
          '"><img src="' +
          storeTools.escapeHTML(images[imageIndex]) +
          '" alt="Thumbnail ' +
          (imageIndex + 1) +
          '" /></button>';
      }

      detailThumbs.innerHTML = html;
    }

    function moveSlide(direction) {
      if (!selectedProduct) {
        return;
      }

      selectedImageIndex += direction;
      renderDetailImage();
    }
  }
})();
