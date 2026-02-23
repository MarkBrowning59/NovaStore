import test from "node:test";
import assert from "node:assert/strict";
import { resolveBindings } from "../utils/resolveBindings.js";
import { resolvePath } from "../utils/resolvePath.js";

test("resolvePath reads dot and array-index paths", () => {
  const product = {
    ProductDefinition: { Name: "Poster" },
    IDs: [{ ID: "XMPie13347" }],
  };

  assert.equal(resolvePath({ product }, "product.ProductDefinition.Name"), "Poster");
  assert.equal(resolvePath({ product }, "product.IDs[0].ID"), "XMPie13347");
  assert.equal(resolvePath({ product }, "product.missing.path"), undefined);
});

test("resolveBindings resolves single-value bindings without coercing type", () => {
  const product = { Pricing: { BasePrice: 19.99 }, Active: true };
  const props = {
    price: "{{ product.Pricing.BasePrice }}",
    active: "{{product.Active}}",
  };

  const result = resolveBindings(props, { product });

  assert.equal(result.price, 19.99);
  assert.equal(result.active, true);
});

test("resolveBindings resolves nested objects and inline string bindings", () => {
  const product = {
    ProductDefinition: { Name: "Photo Book" },
    IDs: [{ ID: "XMPie13347" }],
  };
  const props = {
    title: "Buy {{ product.ProductDefinition.Name }} now",
    meta: {
      id: "{{product.IDs[0].ID}}",
      items: ["{{product.ProductDefinition.Name}}", "static"],
    },
  };

  const result = resolveBindings(props, { product });

  assert.equal(result.title, "Buy Photo Book now");
  assert.equal(result.meta.id, "XMPie13347");
  assert.deepEqual(result.meta.items, ["Photo Book", "static"]);
});

test("resolveBindings keeps unresolved bindings unchanged", () => {
  const result = resolveBindings(
    { title: "{{product.ProductDefinition.Missing}}", line: "Hi {{ product.Unknown }}" },
    { product: { ProductDefinition: { Name: "A" } } }
  );

  assert.equal(result.title, "{{product.ProductDefinition.Missing}}");
  assert.equal(result.line, "Hi {{product.Unknown}}");
});
