import * as path from "path";
import constants from "../constants";

export function getScenarioPath(scenarioType: string, scenarioName: string) {
    return path.join(constants.SCENARIOS_ROOT, scenarioType, scenarioName);
}
