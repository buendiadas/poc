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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.description = exports.command = void 0;
var os_1 = __importDefault(require("os"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var throat_1 = __importDefault(require("throat"));
var glob_1 = __importDefault(require("glob"));
var jest_worker_1 = __importDefault(require("jest-worker"));
exports.command = 'codegen <input> <output>';
exports.description = 'Generates code for your contracts.';
exports.builder = function (yargs) {
    return yargs
        .positional('input', {
        describe: 'The input file or glob pattern.',
        demandOption: true,
        type: 'string',
    })
        .positional('output', {
        describe: 'The output directory.',
        demandOption: true,
        type: 'string',
    })
        .positional('format', {
        describe: 'The output format.',
        choices: ['artifact', 'signatures'],
        default: 'artifact',
        demandOption: true,
        type: 'string',
    });
};
exports.handler = function (args) { return __awaiter(void 0, void 0, void 0, function () {
    var cwd, format, matches, destination, workerPath, workerCount, worker, mutex, run, stdout, stderr, runners;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cwd = process.cwd();
                format = args.format;
                matches = glob_1.default.sync(args.input, {
                    absolute: true,
                    nodir: true,
                    cwd: cwd,
                });
                if (!matches.length) {
                    throw new Error('No files matched the given pattern');
                }
                destination = path_1.default.resolve(cwd, args.output);
                if (!fs_1.default.existsSync(destination)) {
                    fs_1.default.mkdirSync(destination, {
                        recursive: true,
                    });
                }
                workerPath = require.resolve('../workers/codegen');
                workerCount = Math.max(os_1.default.cpus().length - 1, 1);
                worker = new jest_worker_1.default(workerPath, {
                    exposedMethods: ['generate'],
                    forkOptions: { stdio: 'pipe' },
                    numWorkers: workerCount,
                });
                mutex = throat_1.default(workerCount);
                run = function (match, destination) {
                    return mutex(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/, worker.generate(match, destination, format)];
                    }); }); });
                };
                stdout = worker.getStdout();
                if (stdout) {
                    stdout.pipe(process.stdout);
                }
                stderr = worker.getStderr();
                if (stderr) {
                    stderr.pipe(process.stderr);
                }
                runners = matches.map(function (match) { return run(match, destination); });
                return [4 /*yield*/, Promise.all(runners).finally(function () { return worker.end(); })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
