import * as valirator from '../dist/valirator';

describe('rules', () => {
  describe('allowEmptyRule', () => {
    const { allowEmptyRule } = valirator;

    it('should allow empty value', () => {
      const result = allowEmptyRule('', true);

      expect(result).toBe(true);
    });

    it('should disallow empty value', () => {
      const result = allowEmptyRule('', false);

      expect(result).toBe(false);
    });

    it('should pass validation', () => {
      const result = allowEmptyRule('value', false);

      expect(result).toBe(true);
    });
  });

  describe('divisibleByRule', () => {
    const { divisibleByRule } = valirator;

    it('should be divisible by 3.3', () => {
      const result = divisibleByRule(9.9, 3.3);

      expect(result).toBe(true);
    });

    it('should not be divisible by 3.3', () => {
      const result = divisibleByRule(10, 3.3);

      expect(result).toBe(false);
    });
  });

  describe('enumRule', () => {
    const { enumRule } = valirator;

    it('should be in enum', () => {
      const result = enumRule('value1', ['value1', 'value2', 'value3']);

      expect(result).toBe(true);
    });

    it('should not be in enum', () => {
      const result = enumRule('value4', ['value1', 'value2', 'value3']);

      expect(result).toBe(false);
    });
  });

  describe('formatRule', () => {
    const { formatRule } = valirator;

    it('should respect email format', () => {
      const result = formatRule('email@example.com', 'email');

      expect(result).toBe(true);
    });

    it('should not respect email format', () => {
      const result = formatRule('email@example@com.com', 'email');

      expect(result).toBe(false);
    });

    it('should throw error for unknown format', () => {
      expect(() => formatRule('email@example.com', 'email2')).toThrow(new Error('Unknown format "email2"'));
    });
  });

  describe('maxRule', () => {
    const { maxRule } = valirator;

    it('should be lower or equal then 5', () => {
      const result = maxRule(5, 5);

      expect(result).toBe(true);
    });

    it('should not be lower or equal lower then 5', () => {
      const result = maxRule(10, 5);

      expect(result).toBe(false);
    });
  });

  describe('maxItemsRule', () => {
    const { maxItemsRule } = valirator;

    it('should has less or equal then 5 item', () => {
      const result = maxItemsRule([1, 2, 3, 4, 5], 5);

      expect(result).toBe(true);
    });

    it('should not has less or equal then 5 item', () => {
      const result = maxItemsRule([1, 2, 3, 4, 5, 6], 5);

      expect(result).toBe(false);
    });
  });

  describe('maxLengthRule', () => {
    const { maxLengthRule } = valirator;

    it('should be less or equal then 5 length string', () => {
      const result = maxLengthRule('12345', 5);

      expect(result).toBe(true);
    });

    it('should not be less or equal then 5 length string', () => {
      const result = maxLengthRule('123456', 5);

      expect(result).toBe(false);
    });
  });

  describe('exclusiveMaxRule', () => {
    const { exclusiveMaxRule } = valirator;

    it('should be lower then 5', () => {
      const result = exclusiveMaxRule(1, 5);

      expect(result).toBe(true);
    });

    it('should not be lower then 5', () => {
      const result = exclusiveMaxRule(10, 5);

      expect(result).toBe(false);
    });
  });

  describe('minRule', () => {
    const { minRule } = valirator;

    it('should be bigger or equal then 5', () => {
      const result = minRule(5, 5);

      expect(result).toBe(true);
    });

    it('should not be bigger or equal lower then 5', () => {
      const result = minRule(1, 5);

      expect(result).toBe(false);
    });
  });

  describe('minItemsRule', () => {
    const { minItemsRule } = valirator;

    it('should has more or equal then 5 item', () => {
      const result = minItemsRule([1, 2, 3, 4, 5], 5);

      expect(result).toBe(true);
    });

    it('should not has more or equal then 5 item', () => {
      const result = minItemsRule([1, 2, 3, 4], 5);

      expect(result).toBe(false);
    });
  });

  describe('minLengthRule', () => {
    const { minLengthRule } = valirator;

    it('should be bigger or equal then 5 length string', () => {
      const result = minLengthRule('12345', 5);

      expect(result).toBe(true);
    });

    it('should not be bigger or equal then 5 length string', () => {
      const result = minLengthRule('1234', 5);

      expect(result).toBe(false);
    });
  });

  describe('exclusiveMinRule', () => {
    const { exclusiveMinRule } = valirator;

    it('should be bigger then 5', () => {
      const result = exclusiveMinRule(10, 5);

      expect(result).toBe(true);
    });

    it('should not be bigger then 5', () => {
      const result = exclusiveMinRule(1, 5);

      expect(result).toBe(false);
    });
  });

  describe('patternRule', () => {
    const { patternRule } = valirator;

    it('should match pattern \d+', () => {
      const result = patternRule('1234', /\d+/);

      expect(result).toBe(true);
    });

    it('should not match pattern \d+', () => {
      const result = patternRule('abc', /\d+/);

      expect(result).toBe(false);
    });
  });

  describe('requiredRule', () => {
    const { requiredRule } = valirator;

    it('should be required', () => {
      const result = requiredRule(null, true);

      expect(result).toBe(false);
    });

    it('should not be required', () => {
      const result = requiredRule(null, false);

      expect(result).toBe(true);
    });

    it('should pass validation', () => {
      const result = requiredRule('123', true);

      expect(result).toBe(true);
    });
  });

  describe('typeRule', () => {
    const { typeRule } = valirator;

    it('should be boolean', () => {
      const result = typeRule(true, 'boolean');

      expect(result).toBe(true);
    });

    it('should not be boolean', () => {
      const result = typeRule(0, 'boolean');

      expect(result).toBe(false);
    });

    it('should be number', () => {
      const result = typeRule(1, 'number');

      expect(result).toBe(true);
    });

    it('should not be number', () => {
      const result = typeRule('1', 'number');

      expect(result).toBe(false);
    });

    it('should be string', () => {
      const result = typeRule('abc', 'string');

      expect(result).toBe(true);
    });

    it('should not be string', () => {
      const result = typeRule(null, 'string');

      expect(result).toBe(false);
    });

    it('should be date', () => {
      const result = typeRule(new Date(), 'date');

      expect(result).toBe(true);
    });

    it('should not be date', () => {
      const result = typeRule('2017-02-11', 'date');

      expect(result).toBe(false);
    });

    it('should be object', () => {
      const result = typeRule({ a: 1, b: 2 }, 'object');

      expect(result).toBe(true);
    });

    it('should not be object', () => {
      const result = typeRule(new Date(), 'object');

      expect(result).toBe(false);
    });

    it('should be array', () => {
      const result = typeRule([1, 2, 3], 'array');

      expect(result).toBe(true);
    });

    it('should not be array', () => {
      const result = typeRule({ '0': 0, '1': 1, '2': 2 }, 'array');

      expect(result).toBe(false);
    });
  });

  describe('uniqueItemsRule', () => {
    const { uniqueItemsRule } = valirator;

    it('should has only unique items', () => {
      const result = uniqueItemsRule([{ a: 1 }, { a: 2}, { a: 1 }], true);

      expect(result).toBe(false);
    });

    it('should not only uniq items', () => {
      const result = uniqueItemsRule([{ a: 1 }, { a: 2}, { a: 1 }], false);

      expect(result).toBe(true);
    });

    it('should pass validation', () => {
      const result = uniqueItemsRule([{ a: 1 }, { a: 2}, { a: 3 }], true);

      expect(result).toBe(true);
    });
  });
});
