var STORE_KEY = "threadline-store-dashboard";

var defaultStore = {
  profile: {
    name: "Threadline Studio",
    initials: "TS",
    title: "Threadline Studio - Kaos Daily Wear",
    logo: "",
    heroImage: "assets/kaos-collection.png",
    eyebrow: "Kaos lokal untuk daily wear",
    headline: "Kaos minimalis yang nyaman dipakai dari kerja sampai akhir pekan.",
    description:
      "Koleksi kaos premium dengan bahan adem, potongan rapi, dan warna yang mudah dipadukan. Pesan cepat lewat WhatsApp atau checkout langsung via Shopee.",
    catalogTitle: "Pilih warna favoritmu",
    catalogText: "Setiap produk bisa dipesan lewat WhatsApp atau Shopee sesuai preferensi pembeli.",
  },
  products: [
    {
      id: "essential-black",
      name: "Essential Black Tee",
      price: "Rp129.000",
      category: "basic",
      status: "ready",
      sizes: { S: 8, M: 12, L: 10, XL: 6, XXL: 3 },
      description: "Kaos hitam regular fit untuk outfit harian yang clean dan mudah dipadukan.",
      shirt: "#171717",
      text: "#ffffff",
      images: ["assets/kaos-collection.png"],
      reviews: "Bahan adem, jahitan rapi, dan warna mudah dipadukan untuk outfit harian.",
      comments: [],
      whatsappUrl:
        "https://wa.me/6281234567890?text=Halo%2C%20saya%20mau%20pesan%20Essential%20Black%20Tee.",
      shopeeUrl: "https://shopee.co.id/",
      gradient: ["#d9d5ce", "#f6f0e8"],
    },
    {
      id: "classic-white",
      name: "Classic White Tee",
      price: "Rp119.000",
      category: "basic",
      status: "ready",
      sizes: { S: 7, M: 10, L: 9, XL: 5, XXL: 2 },
      description: "Kaos putih katun combed dengan handfeel lembut dan jahitan leher rapi.",
      shirt: "#f7f5ed",
      text: "#1c1b19",
      images: ["assets/kaos-collection.png"],
      reviews: "Warna putihnya bersih, nyaman dipakai, dan cocok untuk layering.",
      comments: [],
      whatsappUrl:
        "https://wa.me/6281234567890?text=Halo%2C%20saya%20mau%20pesan%20Classic%20White%20Tee.",
      shopeeUrl: "https://shopee.co.id/",
      gradient: ["#e7e1d7", "#ffffff"],
    },
    {
      id: "sage-weekend",
      name: "Sage Weekend Tee",
      price: "Rp139.000",
      category: "earth",
      status: "ready",
      sizes: { S: 5, M: 8, L: 7, XL: 4, XXL: 1 },
      description: "Warna sage yang kalem untuk gaya santai, cocok dipakai indoor maupun outdoor.",
      shirt: "#7f9b85",
      text: "#ffffff",
      images: ["assets/kaos-collection.png"],
      reviews: "Tone sage terlihat kalem dan tetap stylish untuk aktivitas santai.",
      comments: [],
      whatsappUrl:
        "https://wa.me/6281234567890?text=Halo%2C%20saya%20mau%20pesan%20Sage%20Weekend%20Tee.",
      shopeeUrl: "https://shopee.co.id/",
      gradient: ["#dce7d9", "#f4eee4"],
    },
    {
      id: "terracotta-drop",
      name: "Terracotta Drop Tee",
      price: "Rp149.000",
      category: "limited",
      status: "preorder",
      sizes: { S: 0, M: 4, L: 4, XL: 2, XXL: 0 },
      description: "Edisi warna hangat dengan stok terbatas dan karakter visual yang lebih bold.",
      shirt: "#b96549",
      text: "#ffffff",
      images: ["assets/kaos-collection.png"],
      reviews: "Warna terracotta memberi tampilan hangat dan terasa berbeda dari kaos basic.",
      comments: [],
      whatsappUrl:
        "https://wa.me/6281234567890?text=Halo%2C%20saya%20mau%20pesan%20Terracotta%20Drop%20Tee.",
      shopeeUrl: "https://shopee.co.id/",
      gradient: ["#efd2bd", "#f8eee6"],
    },
  ],
};

function cloneDefaultStore() {
  return JSON.parse(JSON.stringify(defaultStore));
}

function createProductId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return "product-" + Date.now();
}

function buildProductWhatsApp(product, phoneNumber) {
  var targetPhone = phoneNumber || "6281234567890";
  var message =
    "Halo, saya mau pesan " + product.name + " (" + product.price + "). Apakah stok masih tersedia?";

  return "https://wa.me/" + targetPhone + "?text=" + encodeURIComponent(message);
}

function normalizeSizes(sizes) {
  var defaults = { S: 0, M: 0, L: 0, XL: 0, XXL: 0 };
  var key;
  var value;

  if (!sizes) {
    return defaults;
  }

  for (key in defaults) {
    if (Object.prototype.hasOwnProperty.call(defaults, key)) {
      value = Number(sizes[key]);
      defaults[key] = Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
    }
  }

  return defaults;
}

function migrateProduct(product) {
  var images = [];

  if (Array.isArray(product.images)) {
    images = product.images;
  } else if (product.image) {
    images = [product.image];
  }

  return {
    id: product.id || createProductId(),
    name: product.name || "Produk Baru",
    price: product.price || "Rp0",
    category: product.category || "basic",
    status: product.status || "ready",
    sizes: normalizeSizes(product.sizes),
    description: product.description || "",
    shirt: product.shirt || "#171717",
    text: product.text || "#ffffff",
    images: images.slice(0, 7),
    cardImageIndex: Number(product.cardImageIndex) || 0,
    image: images[Number(product.cardImageIndex) || 0] || images[0] || "",
    reviews: product.reviews || "Belum ada ulasan untuk produk ini.",
    comments: Array.isArray(product.comments) ? product.comments : [],
    whatsappUrl: product.whatsappUrl || buildProductWhatsApp(product, "6281234567890"),
    shopeeUrl: product.shopeeUrl || product.shopeeStoreUrl || "https://shopee.co.id/",
    gradient: product.gradient || ["#e7e1d7", "#ffffff"],
  };
}

function mergeProfile(savedProfile) {
  var mergedProfile = {};
  var key;

  for (key in defaultStore.profile) {
    if (Object.prototype.hasOwnProperty.call(defaultStore.profile, key)) {
      mergedProfile[key] = defaultStore.profile[key];
    }
  }

  if (savedProfile) {
    for (key in savedProfile) {
      if (Object.prototype.hasOwnProperty.call(savedProfile, key)) {
        mergedProfile[key] = savedProfile[key];
      }
    }
  }

  return mergedProfile;
}

function loadStore() {
  var savedStore;
  var parsedStore;
  var products;

  try {
    savedStore = localStorage.getItem(STORE_KEY);
  } catch (error) {
    return cloneDefaultStore();
  }

  if (!savedStore) {
    return cloneDefaultStore();
  }

  try {
    parsedStore = JSON.parse(savedStore);
    products = Array.isArray(parsedStore.products)
      ? parsedStore.products.map(migrateProduct)
      : cloneDefaultStore().products;

    return {
      profile: mergeProfile(parsedStore.profile),
      products: products,
    };
  } catch (error) {
    return cloneDefaultStore();
  }
}

function getCloudConfig() {
  return window.StoreCloudConfig || {};
}

function isCloudStoreEnabled() {
  var config = getCloudConfig();

  return Boolean(config.supabaseUrl && config.supabaseAnonKey);
}

function normalizeStore(store) {
  var products = Array.isArray(store.products)
    ? store.products.map(migrateProduct)
    : cloneDefaultStore().products;

  return {
    profile: mergeProfile(store.profile),
    products: products,
  };
}

function saveStore(store) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
    saveCloudStore(store);
    return true;
  } catch (error) {
    return false;
  }
}

function saveLocalStore(store) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
    return true;
  } catch (error) {
    return false;
  }
}

function getSupabaseHeaders(config) {
  return {
    apikey: config.supabaseAnonKey,
    Authorization: "Bearer " + config.supabaseAnonKey,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates",
  };
}

function getSupabaseBaseUrl(config) {
  return config.supabaseUrl.replace(/\/$/, "") + "/rest/v1/" + encodeURIComponent(config.table || "site_store");
}

function loadCloudStore(onSuccess, onError) {
  var config = getCloudConfig();
  var url;

  if (!isCloudStoreEnabled() || typeof fetch !== "function") {
    return false;
  }

  url =
    getSupabaseBaseUrl(config) +
    "?id=eq." +
    encodeURIComponent(config.rowId || "threadline") +
    "&select=data";

  fetch(url, {
    headers: getSupabaseHeaders(config),
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Cloud store tidak bisa dibaca.");
      }

      return response.json();
    })
    .then(function (rows) {
      var remoteStore = rows && rows[0] && rows[0].data;

      if (!remoteStore) {
        return;
      }

      remoteStore = normalizeStore(remoteStore);
      saveLocalStore(remoteStore);

      if (typeof onSuccess === "function") {
        onSuccess(remoteStore);
      }
    })
    .catch(function (error) {
      if (typeof onError === "function") {
        onError(error);
      }
    });

  return true;
}

function saveCloudStore(store, onSuccess, onError) {
  var config = getCloudConfig();
  var payload;

  if (!isCloudStoreEnabled() || typeof fetch !== "function") {
    return false;
  }

  payload = {
    id: config.rowId || "threadline",
    data: normalizeStore(store),
    updated_at: new Date().toISOString(),
  };

  fetch(getSupabaseBaseUrl(config) + "?on_conflict=id", {
    method: "POST",
    headers: getSupabaseHeaders(config),
    body: JSON.stringify(payload),
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Cloud store tidak bisa disimpan.");
      }

      if (typeof onSuccess === "function") {
        onSuccess();
      }
    })
    .catch(function (error) {
      if (typeof onError === "function") {
        onError(error);
      }
    });

  return true;
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.StoreData = {
  buildProductWhatsApp: buildProductWhatsApp,
  cloneDefaultStore: cloneDefaultStore,
  createProductId: createProductId,
  escapeHTML: escapeHTML,
  loadStore: loadStore,
  loadCloudStore: loadCloudStore,
  normalizeSizes: normalizeSizes,
  saveCloudStore: saveCloudStore,
  saveLocalStore: saveLocalStore,
  saveStore: saveStore,
};
