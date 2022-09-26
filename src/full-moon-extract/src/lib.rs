use wasm_bindgen::prelude::*;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[derive(serde::Serialize)]
#[serde(tag = "type")]
pub enum ResultOutput {
    Ok {
        ast: full_moon::ast::Ast,
    },

    Err {
        error: full_moon::Error,
        display: String,
    },
}

#[wasm_bindgen]
pub fn parse(code: &str) -> Result<JsValue, JsValue> {
    Ok(match full_moon::parse(code) {
        Ok(ast) => serde_wasm_bindgen::to_value(&ResultOutput::Ok { ast }),
        Err(error) => serde_wasm_bindgen::to_value(&ResultOutput::Err {
            display: error.to_string(),
            error,
        }),
    }?)
}
