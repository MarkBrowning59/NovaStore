const storefrontService = require('../services/storefront.service');

exports.getStorefrontProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await storefrontService.getStorefrontProductById(id);

    if (!result) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error(
      `[GET /api/storefront/products/:id] id=${id} error:`,
      err
    );

    if (err?.status) {
      return res.status(err.status).json({ message: err.message });
    }

    return res.status(500).json({ message: 'Internal server error.' });
  }
};
