"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = void 0;
const axios_1 = __importDefault(require("axios"));
const querystring_1 = require("querystring");
function generateAccessToken(clientId, clientSecret, url, scopes = []) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const payload = { grant_type: 'client_credentials', scope: scopes.length ? scopes.join(' ') : undefined };
            const options = {
                method: 'post',
                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                auth: {
                    username: clientId,
                    password: clientSecret,
                },
                data: querystring_1.stringify(payload),
                url: '/oauth2/token',
                baseURL: url,
            };
            const { data } = yield axios_1.default.request(options);
            return data === null || data === void 0 ? void 0 : data.access_token;
        }
        catch (error) {
            throw error;
        }
    });
}
exports.generateAccessToken = generateAccessToken;
//# sourceMappingURL=index.js.map