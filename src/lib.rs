use diffeq::error::OdeError;
use diffeq::ode::problem::OdeProblem;
use diffeq::ode::solution::OdeSolution;
use diffeq::ode::Ode;
use serde::{Deserialize, Serialize};

use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
pub struct OdeConfig {
    pub trans: f64,
    pub recov: f64,
    pub init: Vec<f64>,
    pub tmax: f64,
}

// Called when the wasm module is instantiated
#[wasm_bindgen(start)]
pub fn main() -> Result<(), JsValue> {
    Ok(())
}

fn derivs(_: f64, y: &Vec<f64>, a: f64, b: f64) -> Vec<f64> {
    vec![-a * y[0] * y[1], a * y[0] * y[1] - b * y[1], b * y[1]]
}

fn solve_internal(
    a: f64,
    b: f64,
    y0: Vec<f64>,
    ts: Vec<f64>,
) -> Result<OdeSolution<f64, Vec<f64>>, OdeError> {
    let problem = OdeProblem::builder()
        .tspan(ts)
        .fun(|t: f64, y: &Vec<f64>| derivs(t, y, a, b))
        .init(y0)
        .build()
        .unwrap();

    problem.solve(Ode::Ode45, Default::default())
}

#[wasm_bindgen]
pub fn solve(config: &JsValue) -> Result<JsValue, JsValue> {
    let config = config
        .into_serde::<OdeConfig>()
        .map_err(|_| JsValue::from_str("Failed to parse configuration."))?;

    let ts = vec![0.0, config.tmax];
    let solution = solve_internal(config.trans, config.recov, config.init, ts)
        .map_err(|e| JsValue::from_str(&format!("{}", e)))?;

    JsValue::from_serde(&solution)
        .map_err(|_| JsValue::from_str("Failed to serialise solution."))
}
