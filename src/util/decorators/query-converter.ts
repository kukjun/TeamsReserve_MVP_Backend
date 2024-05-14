import {
    Transform,
} from "class-transformer";

const queryMapper = new Map([
    ["true",
        true,],
    ["false",
        false,],
]);

export const StringParseBoolean = () =>
    Transform(params => queryMapper.get(String(params.value)));