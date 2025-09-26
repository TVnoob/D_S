import { yomikomi_hannteiC } from "./systems/jobs/kirifuda_subclass/hannteiC";
import { yomikomi_kirifuda } from "./systems/jobs/kirifuda";
import { originalitemscript } from "./systems/jobs/itemsScript";

export function fromJM(){
yomikomi_hannteiC();
yomikomi_kirifuda();
originalitemscript();
}