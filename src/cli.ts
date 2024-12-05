#!/usr/bin/env node

import fs from "fs";
import path from "path";
import inquirer from "inquirer";

// Define o diretório base como o diretório `src` no projeto onde o CLI foi chamado
const baseDir = path.join(process.cwd(), "src");

const capitalize = (str) => str[0].toUpperCase() + str.slice(1);

// Adiciona a importação ao início do arquivo
const addImportToFile = (filePath, componentName, componentType) => {
  // Ajusta o caminho do import dependendo do tipo de componente
  const relativePath =
    componentType === "global"
      ? `@/components/${capitalize(componentName)}`
      : `./components/${capitalize(componentName)}`;

  const importStatement = `import ${capitalize(componentName)} from "${relativePath}";\n`;

  let fileContent = fs.readFileSync(filePath, "utf8");
  if (fileContent.includes(importStatement.trim())) return;

  // Adiciona o import no início do arquivo
  fileContent = `${importStatement}${fileContent}`;
  fs.writeFileSync(filePath, fileContent, "utf8");
};

// Função para criar o componente
const createComponent = async (componentName, content, currentDir) => {
  const { componentType } = await inquirer.prompt([
    { type: "list", name: "componentType", message: "O componente será global ou local?", choices: ["global", "local"] },
  ]);

  const componentDir =
    componentType === "global" ? path.join(baseDir, "components") : path.join(currentDir, "components");

  if (!fs.existsSync(componentDir)) fs.mkdirSync(componentDir, { recursive: true });

  const componentPath = path.join(componentDir, `${capitalize(componentName)}.tsx`);
  if (fs.existsSync(componentPath)) {
    console.log(`O componente "${componentName}" já existe.`);
    return { componentPath, componentType };
  }

  const componentContent = `
export default function ${capitalize(componentName)}() {
  return (
    <>
      ${content}
    </>
  );
}
`;

  fs.writeFileSync(componentPath, componentContent.trim(), "utf8");
  console.log(`Componente "${componentName}" criado com sucesso em "${componentPath}".`);
  return { componentPath, componentType };
};

// Função para processar o comando componentize
const processComponentize = async (componentName) => {
  const filePath = detectActiveFile();
  const fileContent = fs.readFileSync(filePath, "utf8");

  const startIndex = fileContent.indexOf("<mvcube>");
  const endIndex = fileContent.indexOf("</mvcube>");
  if (startIndex === -1 || endIndex === -1) {
    console.error("Erro: Não foi encontrada nenhuma marca <mvcube> no arquivo.");
    return;
  }

  const content = fileContent.slice(startIndex + 8, endIndex).trim();
  const currentDir = path.dirname(filePath);
  const { componentPath, componentType } = await createComponent(componentName, content, currentDir);

  // Ajustando o caminho de importação conforme o tipo de componente
  const relativePath = componentType === "global"
    ? `@/components/${capitalize(componentName)}`
    : path.relative(path.dirname(filePath), componentPath).replace(/\\/g, "/");

  const updatedFileContent = `
${fileContent.slice(0, startIndex)}<${capitalize(componentName)} />${fileContent.slice(endIndex + 9)}
`;
  fs.writeFileSync(filePath, updatedFileContent.trim(), "utf8");

  // Passando o componentType para garantir que o import esteja correto
  addImportToFile(filePath, componentName, componentType);
};

// Função para detectar o arquivo mais recentemente modificado
const getAllFilesRecursively = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      getAllFilesRecursively(filePath, fileList);
    } else if (filePath.endsWith(".tsx") || filePath.endsWith(".ts")) {
      fileList.push(filePath);
    }
  });
  return fileList;
};

const detectActiveFile = () => {
  const allFiles = getAllFilesRecursively(process.cwd());
  const filePaths = allFiles
    .map((file) => ({
      file,
      mtime: fs.statSync(file).mtime.getTime(),
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (filePaths.length === 0) {
    console.error("Erro: Nenhum arquivo TS/TSX encontrado no projeto.");
    process.exit(1);
  }

  return filePaths[0].file;
};

// Funções do comando create
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
export const create${capitalize(resourceName)} = async (data: ${capitalize(resourceName)}) => {
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
  }
};

// Lógica principal
const [command, resourceName] = process.argv.slice(2);

switch (command) {
  case "create":
    if (!resourceName) {
      console.error("Erro: Forneça o nome do recurso que deseja criar.");
      process.exit(1);
    }
    createModel(resourceName);
    createController(resourceName);
    createAppStructure(resourceName);
    console.log(`Estrutura criada para: ${resourceName}`);
    break;
  case "componentize":
    if (!resourceName) {
      console.error("Erro: Forneça o nome do componente.");
      process.exit(1);
    }
    processComponentize(resourceName);
    break;
  default:
    console.error(`Comando não reconhecido: ${command}`);
    process.exit(1);
}
