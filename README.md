# MVCube

**MVCube** is a CLI tool that simplifies the creation of **MVC structures** and **reusable components** in Next.js projects. It helps to quickly set up **Models**, **Controllers**, **Views**, and **Components** (both global and local).

---

## Installation

Install globally with:

```bash
npm install -g mvcube
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

This will generate the necessary files for creating a Model, Controller, and Views for a resource.

### Componentize a section of your code into a reusable component

```bash
mvcube componentize <component-name>
```

Example:

```bash
mvcube componentize button
```

This will extract a section of your code into a reusable component and place it in the appropriate `components` folder. You will then choose whether the component is **global** or **local**.

---

## Generated Structure

The CLI generates the following structure for the `create` command:

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

For the `componentize` command, the CLI creates a component in the `components/` folder:

```
src/
  └── components/
        └── <component-name>.tsx
```

---

### Explanation:

1. **Model (`product.ts`)**: Defines the resource's type in TypeScript.
2. **Controller (`productController.ts`)**: Implements CRUD operations.
3. **Next.js Pages**:
   - **List Page (`page.tsx`)**: Displays a list of resources.
   - **Details Page (`[id]/page.tsx`)**: Displays details of a specific resource.
4. **Component (`<component-name>.tsx`)**: A reusable UI component. You can choose whether the component will be **global** (used throughout the entire application with the alias `@/components/{Componente}`) or **local** (used only within the current page with a relative import `./components/{Componente}`).

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

## Example: `componentize`

When you run:

```bash
mvcube componentize button
```

The CLI will prompt you to choose whether the component should be **global** or **local**. Based on your choice, the component will be placed in the `components/` folder, and it will either be imported **globally** or **locally**.

### Global Component

- **Global components** are stored in the `src/components/` directory and can be used throughout the entire application.
- The import path for **global components** will be:

  ```tsx
  import Button from "@/components/button";
  ```

  Example structure:

  ```
  src/
    └── components/
          └── button.tsx
  ```

### Local Component

- **Local components** are also stored in the `src/components/` directory but are used only within the page where they are located.
- The import path for **local components** will be:

  ```tsx
  import Button from "./components/button";
  ```

  Example structure:

  ```
  src/
    └── components/
          └── button.tsx
  ```

### 1. **Global Component Example (`src/components/button.tsx`)**

```tsx
export default function Button({ label }: { label: string }) {
  return <button>{label}</button>;
}
```

### 2. **Local Component Example (`src/components/button.tsx`)**

```tsx
export default function Button({ label }: { label: string }) {
  return <button>{label}</button>;
}
```

---

## Contributing

Feel free to contribute! Open an issue or submit a pull request on the GitHub repository.

---

## License

This project is licensed under the **MIT License**.
