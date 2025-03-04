import { NgxSerial } from './ngx-serial';

// Mocking the navigator.serial API
const mockSerial = {
  getPorts: jest.fn().mockResolvedValue([]),
  requestPort: jest.fn().mockResolvedValue({
    open: jest.fn(),
    writable: {},
    readable: {},
    close: jest.fn(),
  }),
};

Object.defineProperty(global.navigator, 'serial', {
  value: mockSerial,
  configurable: true,
});

// Mocking TextEncoderStream and TextDecoderStream
class MockTextEncoderStream {
  readable = {};
  writable = {};
}

class MockTextDecoderStream {
  readable = {};
  writable = {};
}

Object.defineProperty(global, 'TextEncoderStream', {
  value: MockTextEncoderStream,
  configurable: true,
});

Object.defineProperty(global, 'TextDecoderStream', {
  value: MockTextDecoderStream,
  configurable: true,
});

// Mocking TransformStream
class MockTransformStream {
  readable = {};
  writable = {};
}

Object.defineProperty(global, 'TransformStream', {
  value: MockTransformStream,
  configurable: true,
});

// Mocking the readFunction
const mockReadFunction = jest.fn();

describe('NgxSerial', () => {
  it('should create an instance', () => {
    expect(new NgxSerial(new Function())).toBeTruthy();
  });

  it('should initialize with default options', () => {
    const ngxSerial = new NgxSerial(mockReadFunction);
    expect(ngxSerial).toBeTruthy();
    expect(ngxSerial['options']).toEqual({
      baudRate: 9600,
      dataBits: 8,
      parity: 'none',
      bufferSize: 256,
      flowControl: 'none',
    });
  });

  it('should override default options', () => {
    const customOptions = {
      baudRate: 115200,
      dataBits: 7,
      parity: 'even',
      bufferSize: 512,
      flowControl: 'hardware',
    };
    const ngxSerial = new NgxSerial(mockReadFunction, customOptions);
    expect(ngxSerial['options']).toEqual(customOptions);
  });

  // TODO: fix TypeError: textEncoder.readable.pipeTo is not a function
  xit('should connect to a serial port', async () => {
    const ngxSerial = new NgxSerial(mockReadFunction);
    const callback = jest.fn();
    await ngxSerial.connect(callback);
    expect(mockSerial.requestPort).toHaveBeenCalled();
    expect(callback).toHaveBeenCalled();
  });

  it('should send data', async () => {
    const ngxSerial = new NgxSerial(mockReadFunction);
    ngxSerial['writer'] = { write: jest.fn() };
    await ngxSerial.sendData('test data');
    expect(ngxSerial['writer'].write).toHaveBeenCalledWith('test data');
  });

  it('should close the connection', async () => {
    const ngxSerial = new NgxSerial(mockReadFunction);
    ngxSerial['reader'] = { cancel: jest.fn() };
    ngxSerial['writer'] = { close: jest.fn() };
    ngxSerial['readableStreamClosed'] = Promise.resolve();
    ngxSerial['writableStreamClosed'] = Promise.resolve();
    ngxSerial['port'] = { close: jest.fn() };
    const callback = jest.fn();
    await ngxSerial.close(callback);
    expect(ngxSerial['reader'].cancel).toHaveBeenCalled();
    expect(ngxSerial['writer'].close).toHaveBeenCalled();
    expect(ngxSerial['port'].close).toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(null);
  });
});
