import type { MediaAsset, ProductImage } from "~/types/db";

const normalizeProductImage = (image: ProductImage, index: number): ProductImage => ({
  asset_id: image.asset_id ?? null,
  url: image.url,
  alt: image.alt ?? "",
  is_primary: image.is_primary ?? index === 0,
  sort_order: image.sort_order ?? index
});

export const useMediaPicker = (initial: ProductImage[] = []) => {
  const selected = ref<ProductImage[]>(
    initial.map((image, index) => normalizeProductImage(image, index))
  );

  const selectedIds = computed(() => {
    return new Set(
      selected.value.map((item) => item.asset_id || item.url)
    );
  });

  const toProductImage = (asset: MediaAsset): ProductImage => ({
    asset_id: asset.id,
    url: asset.public_url || asset.external_url || "",
    alt: asset.alt || asset.label || asset.title || "",
    is_primary: false,
    sort_order: selected.value.length
  });

  const ensurePrimary = () => {
    if (!selected.value.length) return;
    const currentPrimary = selected.value.find((item) => item.is_primary);
    if (!currentPrimary) {
      selected.value[0].is_primary = true;
    }
    selected.value = selected.value.map((item, index) => ({
      ...item,
      is_primary: Boolean(item.is_primary) && index === 0 ? true : item.is_primary,
      sort_order: index
    }));
  };

  const toggleAsset = (asset: MediaAsset) => {
    const key = asset.id;
    const index = selected.value.findIndex((item) => item.asset_id === key);
    if (index >= 0) {
      selected.value = selected.value.filter((item) => item.asset_id !== key);
      ensurePrimary();
      return;
    }
    const next = [...selected.value, toProductImage(asset)];
    if (next.length === 1) next[0].is_primary = true;
    selected.value = next.map((item, idx) => ({ ...item, sort_order: idx }));
  };

  const removeByIndex = (index: number) => {
    selected.value.splice(index, 1);
    ensurePrimary();
    selected.value = selected.value.map((item, idx) => ({
      ...item,
      sort_order: idx
    }));
  };

  const setFeatured = (index: number) => {
    const target = selected.value[index];
    if (!target) return;
    const rest = selected.value.filter((_, idx) => idx !== index);
    selected.value = [
      { ...target, is_primary: true },
      ...rest.map((item) => ({ ...item, is_primary: false }))
    ].map((item, idx) => ({ ...item, sort_order: idx }));
  };

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    const next = [...selected.value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    selected.value = next.map((item, idx) => ({
      ...item,
      is_primary: idx === 0 ? item.is_primary ?? true : item.is_primary,
      sort_order: idx
    }));
    ensurePrimary();
  };

  const replaceAll = (images: ProductImage[]) => {
    selected.value = images.map((image, index) => normalizeProductImage(image, index));
    ensurePrimary();
  };

  return {
    selected,
    selectedIds,
    toggleAsset,
    removeByIndex,
    setFeatured,
    reorder,
    replaceAll
  };
};
