import { yomikomi_hannteiC } from "./jobs/kirifuda_subclass/hannteiC";
import { yomikomi_kirifuda } from "./jobs/kirifuda";
import { originalitemscript } from "./jobs/itemsScript";

export function fromJM(){
yomikomi_hannteiC();
yomikomi_kirifuda();
originalitemscript();
}