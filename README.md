# MVCube CLI

**MVCube CLI** is a tool for quickly creating MVC structures in Next.js projects, including **Models**, **Controllers**, and **Views**.

---

## Installation

Install globally with:

```bash
npm install -g mvcube-cli
```

---

## Usage

### Create an MVC structure for a resource

```bash
mvcube create <resource-name>
```

Example:

```bash
mvcube create product
```

---

## Generated Structure

The CLI generates the following structure:

```
src/
  ├── models/
  │     └── product.ts
  ├── controllers/
  │     └── productController.ts
  └── app/
        └── product/
              ├── page.tsx
              └── [id]/
                    └── page.tsx
```

### Explanation:

1. **Model (`product.ts`)**: Defines the resource's type in TypeScript.
2. **Controller (`productController.ts`)**: Implements CRUD operations.
3. **Next.js Pages**:
   - **List Page (`page.tsx`)**: Displays a list of resources.
   - **Details Page (`[id]/page.tsx`)**: Displays details of a specific resource.

---

## Example: `product`

When you run:

```bash
mvcube create product
```

The following files will be created:

### 1. **Model (`src/models/product.ts`)**

```typescript
export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
};
```

### 2. **Controller (`src/controllers/productController.ts`)**

```typescript
import { Product } from "../models/product";

// List all products
export const getAllProducts = async () => {
  return [{ id: "1", name: "Product A", price: 100 }];
};

// Get a product by ID
export const getProductById = async (id) => {
  return { id, name: "Product A", price: 100 };
};

// Create a product
export const createProduct = async (data: Product) => {
  const newProduct = { id: Date.now().toString(), ...data };
  return newProduct;
};

// Update a product
export const updateProduct = async (id, data) => {
  const updatedProduct = { id, ...data };
  return updatedProduct;
};

// Delete a product
export const deleteProduct = async (id) => {
  return { success: true, id };
};
```

### 3. **List Page (`src/app/product/page.tsx`)**

```tsx
import { getAllProducts } from "../../controllers/productController";

export default async function ProductPage() {
  const products = await getAllProducts();

  return (
    <div>
      <h1>Product List</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} - ${product.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 4. **Details Page (`src/app/product/[id]/page.tsx`)**

```tsx
import { getProductById } from "../../../controllers/productController";

type Params = {
  params: {
    id: string;
  };
};

export default async function ProductDetailPage({ params }: Params) {
  const product = await getProductById(params.id);

  return (
    <div>
      <h1>Product Details</h1>
      <p>Name: {product.name}</p>
      <p>Price: ${product.price}</p>
    </div>
  );
}
```

---

## Contributing

Feel free to contribute! Open an issue or submit a pull request on the GitHub repository.

---

## License

This project is licensed under the **MIT License**.
