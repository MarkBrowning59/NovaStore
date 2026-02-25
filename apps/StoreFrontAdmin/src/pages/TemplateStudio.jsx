import { useEffect, useMemo, useState } from 'react';
import { renderBlocks } from '@novastore/core';
import {
  createProductTemplate,
  deleteProductTemplate,
  fetchProductTemplates,
  fetchProductTemplateByKey,
  cloneProductTemplate,
  updateProductTemplate,
} from '../services/productTemplatesApi';
import { fetchStorefrontProductById } from '../services/storefrontApi';

const BLOCK_TYPES = [
  { type: 'Section', label: 'Section' },
  { type: 'RichText', label: 'Rich Text' },
  { type: 'Image', label: 'Image' },
  { type: 'HtmlCssSection', label: 'HTML + CSS Section' },
  { type: 'ProductTitle', label: 'Product Title' },
  { type: 'PricePanel', label: 'Price Panel' },
  { type: 'AddToCart', label: 'Add To Cart' },
];

function uid(prefix = 'blk') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36)}`;
}

function cloneBlocksWithNewIds(blocks = []) {
  return (Array.isArray(blocks) ? blocks : []).map((b) => ({
    ...b,
    id: uid('blk'),
    props: b?.props && typeof b.props === 'object' ? JSON.parse(JSON.stringify(b.props)) : b?.props,
  }));
}

function defaultPropsFor(type) {
  switch (type) {
    case 'Section':
      return { padding: 'py-8', maxWidth: 'max-w-5xl', align: 'left' };
    case 'RichText':
      return { html: '<p>Type your content…</p>' };
    case 'Image':
      return { src: '', alt: '', className: 'w-full rounded-xl' };
    case 'HtmlCssSection':
      return { html: '<div class="promo">Your HTML here…</div>', css: '.promo { }' };
    case 'ProductTitle':
      return { as: 'h1', className: 'text-3xl font-semibold' };
    case 'PricePanel':
      return { showBreakdown: true };
    case 'AddToCart':
      return { label: 'Add to Cart' };
    default:
      return {};
  }
}

export default function TemplateStudio() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedKey, setSelectedKey] = useState('');

  const [draft, setDraft] = useState(null);
  const [blockTypeToAdd, setBlockTypeToAdd] = useState(BLOCK_TYPES[0].type);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [previewProductId, setPreviewProductId] = useState('');
  const [previewProduct, setPreviewProduct] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const template = draft;

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.key === selectedKey) || null,
    [templates, selectedKey]
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const list = await fetchProductTemplates();
        if (!mounted) return;
        setTemplates(Array.isArray(list) ? list : []);
        // default selection
        const def = (Array.isArray(list) ? list : []).find((t) => t.isDefault);
        const first = (Array.isArray(list) ? list : [])[0];
        setSelectedKey((def || first)?.key || '');
      } catch (e) {
        setError(e?.message || 'Failed to load templates');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // keep a local editable draft
  useEffect(() => {
    if (!selectedTemplate) {
      setDraft(null);
      setSelectedBlockId(null);
      return;
    }
    setDraft({
      key: selectedTemplate.key,
      name: selectedTemplate.name || selectedTemplate.key,
      isDefault: !!selectedTemplate.isDefault,
      blocks: Array.isArray(selectedTemplate.blocks) ? selectedTemplate.blocks : [],
    });
    setSelectedBlockId(null);
  }, [selectedTemplate]);

  async function refreshList(preserveKey = true) {
    const list = await fetchProductTemplates();
    setTemplates(Array.isArray(list) ? list : []);
    if (!preserveKey) return;
    const stillThere = (Array.isArray(list) ? list : []).some((t) => t.key === selectedKey);
    if (!stillThere) setSelectedKey((Array.isArray(list) ? list : [])[0]?.key || '');
  }

  function updateDraft(patch) {
    setDraft((d) => (d ? { ...d, ...patch } : d));
  }

  function addBlock() {
    const type = blockTypeToAdd;
    const newBlock = {
      id: uid('blk'),
      type,
      props: defaultPropsFor(type),
    };
    updateDraft({ blocks: [...(draft?.blocks || []), newBlock] });
    setSelectedBlockId(newBlock.id);
  }

  function moveBlock(id, dir) {
    const blocks = [...(draft?.blocks || [])];
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const next = idx + dir;
    if (next < 0 || next >= blocks.length) return;
    const tmp = blocks[idx];
    blocks[idx] = blocks[next];
    blocks[next] = tmp;
    updateDraft({ blocks });
  }

  function deleteBlock(id) {
    const blocks = (draft?.blocks || []).filter((b) => b.id !== id);
    updateDraft({ blocks });
    if (selectedBlockId === id) setSelectedBlockId(null);
  }

  function duplicateBlock(id) {
    const blocks = [...(draft?.blocks || [])];
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const copy = { ...blocks[idx], id: uid('blk') };
    blocks.splice(idx + 1, 0, copy);
    updateDraft({ blocks });
    setSelectedBlockId(copy.id);
  }

  const selectedBlock = useMemo(
    () => (draft?.blocks || []).find((b) => b.id === selectedBlockId) || null,
    [draft, selectedBlockId]
  );

  function updateSelectedBlockProps(text) {
    try {
      const parsed = JSON.parse(text);
      const blocks = (draft?.blocks || []).map((b) => (b.id === selectedBlockId ? { ...b, props: parsed } : b));
      updateDraft({ blocks });
      setError('');
    } catch {
      setError('Props must be valid JSON.');
    }
  }

  async function saveTemplate() {
    if (!draft?.key) return;
    setSaving(true);
    setError('');
    try {
      await updateProductTemplate(draft.key, {
        name: draft.name,
        isDefault: draft.isDefault,
        blocks: draft.blocks,
      });
      await refreshList(true);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to save template');
    } finally {
      setSaving(false);
    }
  }

  async function createNewTemplate() {
    const key = prompt('Template key (e.g. standard-product):');
    if (!key) return;
    setSaving(true);
    setError('');
    try {
      await createProductTemplate({
        key,
        name: key,
        isDefault: false,
        blocks: [],
      });
      await refreshList(false);
      setSelectedKey(key);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to create template');
    } finally {
      setSaving(false);
    }
  }

  async function cloneCurrentTemplate() {
    if (!draft?.key) return;
    const newKey = prompt('New template key (clone):', `${draft.key}-copy`);
    if (!newKey) return;
    const newName = prompt('New template name:', `${draft.name || draft.key} (Copy)`) || newKey;

    
    setSaving(true);
    setError('');
    try {
      // Prefer backend clone endpoint if available.
      try {
        await cloneProductTemplate(draft.key, { newKey, name: newName });
      } catch {
        // Fallback: clone client-side (works even if backend doesn't have /clone).
        const source = await fetchProductTemplateByKey(draft.key);
        await createProductTemplate({
          key: newKey,
          name: newName,
          isDefault: false,
          blocks: cloneBlocksWithNewIds(source?.blocks || []),
        });
      }
      await refreshList(false);
      setSelectedKey(newKey);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to clone template');
    } finally {
      setSaving(false);
    }
  }

  async function deleteCurrentTemplate() {
    if (!draft?.key) return;
    const ok = window.confirm(`Delete template "${draft.name || draft.key}" (key: ${draft.key})?\n\nThis cannot be undone.`);
    if (!ok) return;
    setSaving(true);
    setError('');
    try {
      await deleteProductTemplate(draft.key);
      await refreshList(false);
      // selection handled in refreshList
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to delete template');
    } finally {
      setSaving(false);
    }
  }

  async function loadPreviewProduct() {
    const id = previewProductId.trim();
    if (!id) {
      setPreviewError('Enter a product ID to load preview.');
      setPreviewProduct(null);
      return;
    }

    setPreviewLoading(true);
    setPreviewError('');
    try {
      const response = await fetchStorefrontProductById(id);
      setPreviewProduct(response?.product || null);
    } catch (e) {
      setPreviewProduct(null);
      setPreviewError(e?.response?.data?.message || e?.message || 'Failed to load preview product');
    } finally {
      setPreviewLoading(false);
    }
  }

  if (loading) {
    return <div className="p-4">Loading templates…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-teal-900">Template Studio</h1>
          <p className="text-sm text-teal-800">Build product page layouts from approved blocks (Year 1: HTML + CSS only).</p>
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-2 rounded-lg bg-teal-700 text-white hover:bg-teal-800"
            onClick={createNewTemplate}
          >
            New Template
          </button>
          <button
            className={`px-3 py-2 rounded-lg ${draft ? 'bg-teal-600 hover:bg-teal-700' : 'bg-teal-200'} text-white`}
            onClick={cloneCurrentTemplate}
            disabled={saving || !draft}
            title="Clone the selected template"
          >
            Clone
          </button>
          <button
            className={`px-3 py-2 rounded-lg ${draft ? 'bg-red-600 hover:bg-red-700' : 'bg-red-200'} text-white`}
            onClick={deleteCurrentTemplate}
            disabled={saving || !draft}
            title="Delete the selected template"
          >
            Delete
          </button>
          <button
            className={`px-3 py-2 rounded-lg ${saving ? 'bg-teal-300' : 'bg-teal-600 hover:bg-teal-700'} text-white`}
            onClick={saveTemplate}
            disabled={saving || !draft}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800">{error}</div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: template + blocks */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-4 bg-white rounded-xl shadow border">
            <label className="block text-sm font-medium text-teal-900">Template</label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
            >
              {templates.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.name || t.key}{t.isDefault ? ' (default)' : ''}
                </option>
              ))}
            </select>

            {draft ? (
              <div className="mt-3 space-y-2">
                <label className="block text-sm font-medium text-teal-900">Name</label>
                <input
                  className="w-full border rounded-lg px-3 py-2"
                  value={draft.name || ''}
                  onChange={(e) => updateDraft({ name: e.target.value })}
                />

                <div className="flex items-center gap-2">
                  <input
                    id="isDefault"
                    type="checkbox"
                    checked={!!draft.isDefault}
                    onChange={(e) => updateDraft({ isDefault: e.target.checked })}
                  />
                  <label htmlFor="isDefault" className="text-sm text-teal-900">
                    Default template
                  </label>
                </div>
                <div className="text-xs text-teal-700">Key: <span className="font-mono">{draft.key}</span></div>
              </div>
            ) : null}
          </div>

          <div className="p-4 bg-white rounded-xl shadow border space-y-3">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-teal-900">Add block</label>
                <select
                  className="mt-1 w-full border rounded-lg px-3 py-2"
                  value={blockTypeToAdd}
                  onChange={(e) => setBlockTypeToAdd(e.target.value)}
                >
                  {BLOCK_TYPES.map((b) => (
                    <option key={b.type} value={b.type}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="px-3 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
                onClick={addBlock}
                disabled={!draft}
              >
                Add
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-teal-900">Blocks</div>
              {(draft?.blocks || []).length === 0 ? (
                <div className="text-sm text-teal-700">No blocks yet. Add your first block.</div>
              ) : (
                <ul className="space-y-2">
                  {(draft?.blocks || []).map((b, idx) => (
                    <li
                      key={b.id}
                      className={`p-3 rounded-lg border cursor-pointer ${selectedBlockId === b.id ? 'bg-teal-50 border-teal-300' : 'bg-white'}`}
                      onClick={() => setSelectedBlockId(b.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold text-teal-900">{idx + 1}. {b.type}</div>
                          <div className="text-xs text-teal-700 font-mono">{b.id}</div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            className="px-2 py-1 text-xs rounded bg-teal-100 hover:bg-teal-200"
                            onClick={(e) => { e.stopPropagation(); moveBlock(b.id, -1); }}
                            title="Move up"
                          >
                            ↑
                          </button>
                          <button
                            className="px-2 py-1 text-xs rounded bg-teal-100 hover:bg-teal-200"
                            onClick={(e) => { e.stopPropagation(); moveBlock(b.id, 1); }}
                            title="Move down"
                          >
                            ↓
                          </button>
                          <button
                            className="px-2 py-1 text-xs rounded bg-teal-100 hover:bg-teal-200"
                            onClick={(e) => { e.stopPropagation(); duplicateBlock(b.id); }}
                            title="Duplicate"
                          >
                            ⧉
                          </button>
                          <button
                            className="px-2 py-1 text-xs rounded bg-red-100 hover:bg-red-200"
                            onClick={(e) => { e.stopPropagation(); deleteBlock(b.id); }}
                            title="Delete"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right: block props editor */}
        <div className="lg:col-span-8 space-y-3">
          <div className="p-4 bg-white rounded-xl shadow border">
            <h2 className="text-lg font-semibold text-teal-900">Block Settings</h2>
            {!selectedBlock ? (
              <div className="text-sm text-teal-700 mt-2">Select a block to edit its props.</div>
            ) : (
              <div className="mt-3 space-y-2">
                <div className="text-sm text-teal-800">
                  <span className="font-semibold">Type:</span> {selectedBlock.type} &nbsp;|&nbsp; <span className="font-semibold">ID:</span> <span className="font-mono">{selectedBlock.id}</span>
                </div>
                <label className="block text-sm font-medium text-teal-900">Props (JSON)</label>
                <textarea
                  className="w-full min-h-[260px] border rounded-lg px-3 py-2 font-mono text-sm"
                  value={JSON.stringify(selectedBlock.props ?? {}, null, 2)}
                  onChange={(e) => updateSelectedBlockProps(e.target.value)}
                />
                <div className="text-xs text-teal-700">
                  Tip: Keep it simple. Year 1 allows HTML + CSS blocks, no scripts.
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 space-y-3">
            <div className="text-sm text-teal-900 font-medium">Preview</div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Product ID (e.g. XMPie13347)"
                value={previewProductId}
                onChange={(e) => setPreviewProductId(e.target.value)}
              />
              <button
                className={`px-3 py-2 rounded-lg text-white ${previewLoading ? 'bg-teal-300' : 'bg-teal-600 hover:bg-teal-700'}`}
                onClick={loadPreviewProduct}
                disabled={previewLoading}
              >
                {previewLoading ? 'Loading...' : 'Load Preview'}
              </button>
            </div>

            {previewError ? (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {previewError}
              </div>
            ) : null}

            {!template?.blocks?.length ? (
              <div className="text-sm text-teal-800">Add blocks to see preview output.</div>
            ) : !previewProduct ? (
              <div className="text-sm text-teal-800">Load a product to preview this template.</div>
            ) : (
              <div className="rounded-lg border bg-white p-4 space-y-4">
                {renderBlocks(template.blocks, { product: previewProduct })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
