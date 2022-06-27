import { Shader } from "../gl-util";

export class Material {
    public shader: Shader;

    public constructor(shader: Shader){
        this.shader = shader;
    }
}