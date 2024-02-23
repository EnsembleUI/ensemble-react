import { type Config } from "ts-json-schema-generator";
import tsj from "ts-json-schema-generator";
import fs from "fs";
import { clone, isBoolean, isObject, isArray, get, set } from "lodash-es";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";

const config: Config = {
  path: "packages/runtime/src/shared/coreSchema.ts",
  tsconfig: "./tsconfig.json",

  type: "Root", // Or <type-name> if you want to generate schema for that one type only,
  expose: "all",

  // current json parser chokes at $ref at the root
  topRef: false,
  // enable this if schema docs are broken up into separate URL paths
  encodeRefs: false,

  extraTags: [
    // map to custom UI rendering (e.g. Widget, Padding, ...)
    "uiType",

    // by default a group has a header and collapsible body.
    // We can display this group different (e.g. card, ...)
    "groupDisplay",
  ],

  // additionalProperties: true,

  // strictTuples: true,
  // skipTypeCheck: false,
};

// relative to the root project
const output_path = "apps/preview/public/schema/react/ensemble_schema.json";

const schema = tsj.createGenerator(config).createSchema(config.type);
const schemaString = JSON.stringify(postProcessing(schema), null, 2)
  // hack because current generator chokes on generics when generating ref
  // .replace(/%3C/g, "<").replace(/%3E/g, ">").replace(/%2C/g, ",").replace(/%7C/g, '|');
fs.writeFile(output_path, schemaString, (err) => {
  if (err) throw err;
});

/**
 * Observations:
 * - oneOf for object references is not working properly (unless with additionalProperties: false).
 *   - with required fields (correct) - Monnaco shows duplicates
 *   - without required fields - Monnaco shows no entries
 *   - with additionalProperties: false - then it works properly
 * - anyOf needs to be used without required fields (otherwise no entries shown)
 * - a list of Widgets (e.g. Column's children) won't show up unless additionalProperties=false on each widget
 */
function postProcessing(schema: JSONSchema7) {
  // rename 'definitions' to '$defs'
  schema = renameDefinitionsTo$Defs(schema);

  // add default snippets to Global
  schema = addDefaultSnippetsToCode(schema);

  schema = convertAnyOfToOneOf(schema, "Widget");
  schema = convertAnyOfToOneOf(schema, "Action");

  schema = convertToEnumWithDescription(schema, "ImageFit");
  schema = convertToEnumWithDescription(schema, "ShadowStyle");
  schema = convertToEnumWithDescription(schema, "MainAxisSize");

  // schema = addAdditionalPropertiesFalseToWidget(schema);

  // schema = removeRequiredForAnyOf(schema, null);
  //schema = removeRequiredForAnyOf(schema, "Widget");
  // schema = removeRequiredForAnyOf(schema, "Action");

  // We can reference a custom widget as a widget. In which case the typeahead
  // is confused and won't show up at all. We need to remove
  // each entry's additionalProperties: false.
  // This is not idea as you can specify a widget plus a random string and it
  // is still valid
  // schema = removeAdditionalPropertiesFalseForOneOf(schema, "Widget");

  // This is mostly to keep the schema small, with these EXCEPTIONS:
  // - Widget's additionalProperties HAS to be set to false, or typeahead
  //   won't work for array of widgets (e.g. Column's children)
  schema = removeAdditionalPropertiesFalse(schema);

  return schema;
}

// rename 'definitions' to '$defs' for future proofing
function renameDefinitionsTo$Defs(schema: JSONSchema7) {
  if (schema.definitions) {
    schema.$defs = schema.definitions;
    delete schema.definitions;
  }

  // rename all references
  const schemaString = JSON.stringify(schema);
  const updatedSchemaString = schemaString.replace(
    /#\/definitions\//g,
    "#/$defs/",
  );
  return JSON.parse(updatedSchemaString);
}

/**
 * convert anyOf to oneOf
 */
function convertAnyOfToOneOf(schema: JSONSchema7, name: string) {
  let node: JSONSchema7Definition | null = null;
  if (!name) {
    node = schema;
  } else if (schema.$defs && schema.$defs[name]) {
    node = schema.$defs[name];
  }

  if (!isBoolean(node) && node && isArray(node?.anyOf)) {
    node.oneOf = node.anyOf;
    delete node.anyOf;
  }

  return schema;
}

/**
  remove "required" from anyOf entries, as this will cause typeahead to show zero entry
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function removeRequiredForAnyOf(schema: JSONSchema7, name: string) {
  let node = null;
  if (!name) {
    node = schema;
  } else if (schema.$defs && schema.$defs[name]) {
    node = schema.$defs[name];
  }
  if (!isBoolean(node) && node && Array.isArray(node?.anyOf)) {
    // Iterate over each item in the 'anyOf' array
    node.anyOf.forEach((item) => {
      // If the item is an object and has a 'required' property, delete it
      if (!isBoolean(item) && item.type === "object" && item.required) {
        delete item.required;
      }
    });
  }
  // schema was changed indirectly, return it
  return schema;
}

// remove the presence of additionalProperties: false in each anyOf entry
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function removeAdditionalPropertiesFalseForOneOf(schema: JSONSchema7, name: string) {
  if (schema.$defs && schema.$defs[name]) {
    const definition = schema.$defs[name];
    if (!isBoolean(definition) && definition.oneOf && Array.isArray(definition.oneOf)) {
      definition.oneOf.forEach((item) => {
        if (!isBoolean(item) && item.additionalProperties === false) {
          delete item.additionalProperties;
        }
      });
    }
  }
  return schema;
}

// This is mostly to keep the schema small since this is added to everything.
// The only exceptions are Widget and Action, which requires them.
function removeAdditionalPropertiesFalse(schema: JSONSchema7) {
  if (isBoolean(schema)) {
    return schema;
  }
  
  if (schema.type === "object" && schema.additionalProperties === false) {
    delete schema.additionalProperties;
  }
  if (schema.properties) {
    Object.keys(schema.properties).forEach((key) => {
      const val = schema.properties?.[key];
      if (!isBoolean(val) && val) {
        removeAdditionalPropertiesFalse(val);
      }
    });
  }
  if (schema.$defs) {
    Object.keys(schema.$defs).forEach((key) => {
      // This is important. Widgets need to have additionalProperties: false
      if (key !== "Widget" && key !== "Action") {
        const val = schema.$defs?.[key];
        if (!isBoolean(val) && val) {
          removeAdditionalPropertiesFalse(val);
        }
      }
    });
  }
  if (!isBoolean(schema.items) && isObject(schema.items)) {
    removeAdditionalPropertiesFalse(schema.items as JSONSchema7);
  }
  ["oneOf", "allOf", "anyOf"].forEach((key) => {
    const value = get(schema, key)
    if (value && Array.isArray(value)) {
      value.forEach((subSchema) =>
        removeAdditionalPropertiesFalse(subSchema),
      );
    }
  });

  return schema;
}

// Add default snippets to the Global node
function addDefaultSnippetsToCode(schema: JSONSchema7) {
  const globalNode = schema?.properties?.["Global"];
  if (!isBoolean(globalNode) && globalNode) {
    set(globalNode, "defaultSnippets",[
      {
        label: " ",
        // extra space at the end otherwise the last tab doesn't work
        body: "|-\n\t// Javascript code\n\t${0} ",
      },
    ])
  }
  return schema;
}

// The generator won't allow us to neither:
// 1. generate an enum with description
// 2. nor generate oneOf with inline const/description (it generates $ref for each which makes RJSF confused)
// So this post processing will collapse the $ref into inline const/description
// BE CAFEFUL with this. The definition should only be used once as it'll be remove once moved inline.
function convertToEnumWithDescription(schema: JSONSchema7, name: string) {
  const node = schema.$defs?.[name];
  if (!isBoolean(node) && node && node.anyOf) {
    node.oneOf = node.anyOf.map((item) => {
      if (!isBoolean(item) && item.$ref) {
        const refPath = item.$ref.replace("#/$defs/", "");
        const refDefinition = clone(schema.$defs?.[refPath]);

        // remove the ref once we moved it inline
        delete schema.$defs?.[refPath];

        // Return only const/description. Ignore everything else?
        if (!isBoolean(refDefinition) && refDefinition) {
          return {
            const: refDefinition.const,
            description: refDefinition.description,
          };
        }
      }
      return item;
    });

    // Remove the anyOf since we converted it to oneOf
    delete node.anyOf;

    // add type: string
    node.type = "string";
  }
  return schema;
}
