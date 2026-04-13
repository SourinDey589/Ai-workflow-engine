import { HydratedDocument } from 'mongoose';
export type RequestDocument = HydratedDocument<Request>;
export declare class Request {
    name: string;
    email: string;
    message: string;
    category: string;
    summary: string;
    urgency: string;
}
export declare const RequestSchema: import("mongoose").Schema<Request, import("mongoose").Model<Request, any, any, any, any, any, Request>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Request, import("mongoose").Document<unknown, {}, Request, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Request & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    name?: import("mongoose").SchemaDefinitionProperty<string, Request, import("mongoose").Document<unknown, {}, Request, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Request & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    email?: import("mongoose").SchemaDefinitionProperty<string, Request, import("mongoose").Document<unknown, {}, Request, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Request & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    message?: import("mongoose").SchemaDefinitionProperty<string, Request, import("mongoose").Document<unknown, {}, Request, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Request & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    category?: import("mongoose").SchemaDefinitionProperty<string, Request, import("mongoose").Document<unknown, {}, Request, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Request & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    summary?: import("mongoose").SchemaDefinitionProperty<string, Request, import("mongoose").Document<unknown, {}, Request, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Request & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    urgency?: import("mongoose").SchemaDefinitionProperty<string, Request, import("mongoose").Document<unknown, {}, Request, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Request & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Request>;
