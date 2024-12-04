#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

// Define o diretório base como o diretório `src` no projeto onde o CLI foi chamado
const baseDir = path.join(process.cwd(), "src");

const capitalize = (str) => str[0].toUpperCase() + str.slice(1);

const createModel = (resourceName) => {
  const modelDir = path.join(baseDir, "models");
  if (!fs.existsSync(modelDir)) fs.mkdirSync(modelDir);

  const modelPath = path.join(modelDir, `${resourceName}.ts`);
  if (fs.existsSync(modelPath)) {
    console.log(`O modelo "${resourceName}" já existe. Ignorando.`);
    return;
  }

  const modelContent = `
export type ${capitalize(resourceName)} = {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
};
`;
  fs.writeFileSync(modelPath, modelContent.trim(), "utf8");
  console.log(`Modelo "${resourceName}" criado com sucesso.`);
};

const createController = (resourceName) => {
  const controllerDir = path.join(baseDir, "controllers");
  if (!fs.existsSync(controllerDir)) fs.mkdirSync(controllerDir);

  const controllerPath = path.join(controllerDir, `${resourceName}Controller.ts`);
  if (fs.existsSync(controllerPath)) {
    console.log(`O controlador "${resourceName}" já existe. Ignorando.`);
    return;
  }

  const controllerContent = `
import { ${capitalize(resourceName)} } from "../models/${resourceName}";

// Lista todos os ${resourceName}s
export const getAll${capitalize(resourceName)}s = async () => {
  return [{ id: "1", name: "${resourceName} A", price: 100 }];
};

// Exibe um ${resourceName}
export const get${capitalize(resourceName)}ById = async (id) => {
  return { id, name: "${resourceName} A", price: 100 };
};

// Cria um ${resourceName}
export const create${capitalize(resourceName)} = async (data :  ${capitalize(resourceName)}) => {
  const new${capitalize(resourceName)} = { id: Date.now().toString(), ...data };
  return new${capitalize(resourceName)};
};

// Atualiza um ${resourceName}
export const update${capitalize(resourceName)} = async (id, data) => {
  const updated${capitalize(resourceName)} = { id, ...data };
  return updated${capitalize(resourceName)};
};

// Remove um ${resourceName}
export const delete${capitalize(resourceName)} = async (id) => {
  return { success: true, id };
};
`;
  fs.writeFileSync(controllerPath, controllerContent.trim(), "utf8");
  console.log(`Controlador "${resourceName}" criado com sucesso.`);
};

const createAppStructure = (resourceName) => {
  const appDir = path.join(baseDir, "app");
  const featureDir = path.join(appDir, resourceName);

  if (!fs.existsSync(appDir)) fs.mkdirSync(appDir);
  if (!fs.existsSync(featureDir)) fs.mkdirSync(featureDir);

  const mainPagePath = path.join(featureDir, "page.tsx");
  if (!fs.existsSync(mainPagePath)) {
    const mainPageContent = `
import { getAll${capitalize(resourceName)}s } from "../../controllers/${resourceName}Controller";

export default async function ${capitalize(resourceName)}Page() {
  const ${resourceName}s = await getAll${capitalize(resourceName)}s();

  return (
    <div>
      <h1>Lista de ${resourceName}s</h1>
      <ul>
        {${resourceName}s.map((${resourceName}) => (
          <li key={${resourceName}.id}>
            {${resourceName}.name} - R$ {${resourceName}.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
`;
    fs.writeFileSync(mainPagePath, mainPageContent.trim(), "utf8");
    console.log(`Página principal criada em "${featureDir}".`);
  } else {
    console.log(`A página principal já existe em "${featureDir}". Ignorando.`);
  }

  const detailDir = path.join(featureDir, "[id]");
  if (!fs.existsSync(detailDir)) fs.mkdirSync(detailDir);

  const detailPagePath = path.join(detailDir, "page.tsx");
  if (!fs.existsSync(detailPagePath)) {
    const detailPageContent = `
import { get${capitalize(resourceName)}ById } from "../../../controllers/${resourceName}Controller";

type Params = {
  params: {
    id: string;
  };
};

export default async function ${capitalize(resourceName)}DetailPage({ params }: Params) {
  const ${resourceName} = await get${capitalize(resourceName)}ById(params.id);

  return (
    <div>
      <h1>Detalhes do ${resourceName}</h1>
      <p>Nome: {${resourceName}.name}</p>
      <p>Preço: R$ {${resourceName}.price}</p>
    </div>
  );
}
`;
    fs.writeFileSync(detailPagePath, detailPageContent.trim(), "utf8");
    console.log(`Página de detalhes criada em "${detailDir}".`);
  } else {
    console.log(`A página de detalhes já existe em "${detailDir}". Ignorando.`);
  }
};

// Lógica principal
const [command, resourceName] = process.argv.slice(2);

if (!resourceName) {
  console.error("Erro: Forneça o nome do recurso que deseja criar.");
  process.exit(1);
}

switch (command) {
  case "create":
    createModel(resourceName);
    createController(resourceName);
    createAppStructure(resourceName);
    console.log(`Estrutura criada para: ${resourceName}`);
    break;
  default:
    console.error(`Comando não reconhecido: ${command}`);
    process.exit(1);
}
