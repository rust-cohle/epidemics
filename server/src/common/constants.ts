import * as path from "path";
import { rootPath } from "../root";

let constants: {[property: string]: any} = {
    RESOURCES_ROOT: path.join(rootPath, "../resources")
}

constants = {
    ...constants,
    SCENARIOS_ROOT: path.join(constants.RESOURCES_ROOT, "scenarios")
}

export default constants;
