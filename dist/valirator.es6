function isType(obj, typeStr) {
  return Object.prototype.toString.call(obj) === typeStr;
}

function isObject(obj) {
  return isType(obj, '[object Object]');
}

function isArray(obj) {
  return isType(obj, '[object Array]');
}

function isFunction(obj) {
  return isType(obj, '[object Function]');
}

function isString(obj) {
  return isType(obj, '[object String]');
}

function isDate(obj) {
  return isType(obj, '[object Date]');
}

function isNumber(obj) {
  return isType(obj, '[object Number]') && !isNaN(obj);
}

function isBoolean(obj) {
  return isType(obj, '[object Boolean]');
}

function isDefined(obj) {
  return !(obj === undefined || obj === null || obj === '');
}

function noop() {}

function getObjectOverride(context, prop) {
  if (!context) {
    return false;
  }

  return isFunction(context[prop]) ? context[prop] : getObjectOverride(context.__proto__, prop);
}

function handlePromise(promise) {
  if (promise && promise.then) {
    return promise;
  }

  return {
    then: function then(cb) {
      return handlePromise(cb(promise));
    },
    catch: noop,
    value: promise,
    isPromiseLike: true
  };
}

function handlePromises(promises) {
  var isAnyPromiseNotPromiseLike = promises.some(function (promise) {
    return promise && promise.then && !promise.isPromiseLike;
  });
  if (isAnyPromiseNotPromiseLike) {
    return Promise.all(promises);
  }

  var results = promises.map(function (promise) {
    return promise.value;
  });

  return handlePromise(results);
}

function formatMessage() {
  var message = arguments.length <= 0 || arguments[0] === undefined ? 'No default message for rule "%{rule}"' : arguments[0];
  var actual = arguments[1];
  var expected = arguments[2];
  var property = arguments[3];
  var obj = arguments[4];
  var rule = arguments[5];

  var lookup = {
    actual: actual,
    expected: expected,
    property: property,
    rule: rule
  };

  var formattedMessage = isFunction(message) ? message(actual, expected, property, obj) : isString(message) ? message.replace(/%\{([a-z]+)\}/ig, function (_, match) {
    return lookup[match.toLowerCase()] || '';
  }) : message;

  return handlePromise(formattedMessage);
}

var rulesHolder = {};

function registerRule(name, rule, message) {
  if (rulesHolder.hasOwnProperty(name)) {
    console.warn("[WARNING]: Trying to override defined rule '" + name + "'. Please use 'overrideRule' function instead.");
  }

  rulesHolder[name] = {
    name: name,
    message: message,
    check: rule
  };
}

function hasRule(name) {
  return rulesHolder.hasOwnProperty(name);
}

function getRule(name) {
  return rulesHolder[name] || {};
}

function overrideRule(name, rule, message) {
  if (hasRule(name)) {
    var defaultRule = getRule(name);

    defaultRule.check = rule;
    defaultRule.message = message || defaultRule.message;
  }
}

function overrideRuleMessage(name, message) {
  if (hasRule(name)) {
    var defaultRule = getRule(name);

    defaultRule.message = message;
  }
}

var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

function ValidationResult() {
  var errors = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var that = _extends({}, errors.__proto__, errors);

  Object.defineProperties(that, {
    isValid: {
      value: function isValid() {
        return !this.hasErrors();
      }
    },
    hasErrors: {
      value: function hasErrors() {
        var keys = Object.keys(that);

        return keys.some(function (key) {
          if (that[key].hasErrors) {
            return that[key].hasErrors();
          }

          return that[key];
        });
      }
    },
    hasErrorsOfTypes: {
      value: function hasErrorsOfTypes() {
        for (var _len = arguments.length, types = Array(_len), _key = 0; _key < _len; _key++) {
          types[_key] = arguments[_key];
        }

        var keys = Object.keys(that);

        return keys.some(function (key) {
          if (types.indexOf(key) !== -1) {
            return true;
          }

          if (that[key].hasErrorsOfTypes) {
            var _that$key;

            return (_that$key = that[key]).hasErrorsOfTypes.apply(_that$key, types);
          }

          return false;
        });
      }
    },
    getErrors: {
      value: function getErrors(includeEmptyErrors) {
        var keys = Object.keys(that);

        return keys.reduce(function (result, key) {
          var subErrors = that[key].getErrors ? that[key].getErrors(includeEmptyErrors) : that[key];

          if (Object.keys(subErrors).length || includeEmptyErrors) {
            return _extends({}, result, defineProperty({}, key, subErrors));
          }

          return result;
        }, {});
      }
    },
    getFirstErrors: {
      value: function getFirstErrors(includeEmptyErrors) {
        var keys = Object.keys(that);

        return keys.reduce(function (result, key, index) {
          var subErrors = that[key].getFirstErrors ? that[key].getFirstErrors(includeEmptyErrors) : that[key];

          if (isObject(that[key]) && (Object.keys(subErrors).length || includeEmptyErrors)) {
            return _extends({}, result, defineProperty({}, key, subErrors));
          }

          return index === 0 ? subErrors : result;
        }, {});
      }
    },
    getErrorsAsArray: {
      value: function getErrorsAsArray(includeEmptyErrors) {
        var keys = Object.keys(that);

        return keys.map(function (key) {
          var subErrors = that[key].getErrorsAsArray ? that[key].getErrorsAsArray(includeEmptyErrors) : that[key];

          if (subErrors.length || includeEmptyErrors) {
            return subErrors;
          }

          return null;
        }, {}).filter(function (error) {
          return !!error;
        });
      }
    },
    getFirstError: {
      value: function getFirstError() {
        for (var _len2 = arguments.length, exclude = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          exclude[_key2] = arguments[_key2];
        }

        return (this.getErrorsAsArray(exclude) || [])[0];
      }
    }
  });

  return that;
}

function validateRule(rule, expected, value, message, rules, messages, obj, property, schema) {
  var _getRule = getRule(rule);

  var _getRule$check = _getRule.check;
  var defaultRule = _getRule$check === undefined ? noop : _getRule$check;
  var defaultMessage = _getRule.message;


  var overriddenRule = rules && (getObjectOverride(rules, rule) || rules[rule]);
  var overriddenMessage = messages && (getObjectOverride(messages, rule) || messages[rule]);

  var isValid = (isFunction(overriddenRule) ? overriddenRule : defaultRule)(value, expected, obj, property, schema, defaultRule);

  return handlePromise(isValid).then(function (result) {
    if (isString(result)) {
      return result;
    } else if (result !== true) {
      return formatMessage(overriddenMessage || message || defaultMessage, value, expected, property, obj, rule);
    }
  });
}

function validateRuleSync(rule, expected, value, message, rules, messages, obj, property, schema) {
  var promise = validateRule(rule, expected, value, message, rules, messages, obj, property, schema);

  return promise && promise.value;
}

function validateValue(value) {
  var rules = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var messages = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  var obj = arguments[3];
  var property = arguments[4];
  var schema = arguments[5];

  var keys = Object.keys(rules);
  var promises = keys.map(function (rule) {
    var expected = rules[rule];
    var message = messages[rule];

    return validateRule(rule, expected, value, message, rules, messages, obj, property, schema);
  });

  return handlePromises(promises).then(function (results) {
    var errors = {};

    results.forEach(function (result, i) {
      if (result) {
        errors[keys[i]] = result;
      }
    });

    return new ValidationResult(errors);
  });
}

function validateValueSync(value, rules, messages, obj, property, schema) {
  var promise = validateValue(value, rules, messages, obj, property, schema);

  return promise && promise.value;
}

function validateProperty(property, obj) {
  var properties = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  var rules = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
  var messages = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];
  var _properties$property = properties[property];
  var propertyRules = _properties$property.rules;
  var _properties$property$ = _properties$property.messages;
  var propertyMessages = _properties$property$ === undefined ? {} : _properties$property$;
  var propertyProperties = _properties$property.properties;


  if (!propertyRules) {
    if (!properties[property].messages && !properties[property].properties) {
      propertyRules = properties[property];
    } else {
      propertyRules = {};
    }
  }

  propertyRules.__proto__ = rules;
  propertyMessages.__proto__ = messages;

  var value = obj[property];

  return validateValue(value, propertyRules, propertyMessages, obj, property, properties).then(function (valueValidationResult) {
    if (propertyProperties) {
      var subValidationCallback = function subValidationCallback(subValidationResult) {
        valueValidationResult.__proto__ = subValidationResult;

        return new ValidationResult(valueValidationResult);
      };

      if (isArray(value)) {
        return validateArray(value, propertyProperties, rules, messages).then(subValidationCallback);
      } else if (isObject(value)) {
        return validateObject(value, propertyProperties, rules, messages).then(subValidationCallback);
      }
    }

    return new ValidationResult(valueValidationResult);
  });
}

function validatePropertySync(property, obj, properties, rules, messages) {
  var promise = validateProperty(property, obj, properties, rules, messages);

  return promise && promise.value;
}

function validateArray(array, properties) {
  var rules = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  var messages = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

  var promises = array.map(function (item) {
    return validateObject(item, properties, rules, messages);
  });

  return handlePromises(promises).then(function (results) {
    var errors = {};

    results.forEach(function (result, i) {
      errors[i] = result;
    });

    return new ValidationResult(errors);
  });
}

function validateArraySync(array, properties, rules, messages) {
  var promise = validateArray(array, properties, rules, messages);

  return promise && promise.value;
}

function validateObject(obj, properties) {
  var rules = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  var messages = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

  var keys = Object.keys(properties);
  var promises = keys.map(function (property) {
    return validateProperty(property, obj, properties, rules, messages);
  });

  return handlePromises(promises).then(function (results) {
    var errors = {};

    results.forEach(function (result, i) {
      errors[keys[i]] = result;
    });

    return new ValidationResult(errors);
  });
}

function validateObjectSync(obj, properties, rules, messages) {
  var promise = validateObject(obj, properties, rules, messages);

  return promise && promise.value;
}

function validate(schema, obj) {
  var rules = schema.rules;
  var messages = schema.messages;
  var properties = schema.properties;


  return validateObject(obj, properties || schema, rules, messages);
}

function validateSync(schema, obj) {
  var promise = validate(schema, obj);

  return promise && promise.value;
}

function ValidationSchema(schema) {
  this.validate = validate.bind(this, schema);
  this.validateSync = validateSync.bind(this, schema);
}

function divisibleByRule(value, divisibleBy) {
  if (!isDefined(value)) {
    return true;
  }

  var multiplier = Math.max((value - Math.floor(value)).toString().length - 2, (divisibleBy - Math.floor(divisibleBy)).toString().length - 2);

  multiplier = multiplier > 0 ? Math.pow(10, multiplier) : 1;

  return value * multiplier % (divisibleBy * multiplier) === 0;
}

registerRule('divisibleBy', divisibleByRule, 'must be divisible by %{expected}');

function enumRule(value, e) {
  if (!isDefined(value)) {
    return true;
  }

  return isArray(e) && e.indexOf(value) !== -1;
}

registerRule('enum', enumRule, 'must be present in given enumerator');

var FORMATS = {
  'email': /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
  'ip-address': /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/i,
  'ipv6': /^([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}$/,
  'time': /^\d{2}:\d{2}:\d{2}$/,
  'date': /^\d{4}-\d{2}-\d{2}$/,
  'date-time': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:.\d{1,3})?Z$/,
  'color': /^#[a-z0-9]{6}|#[a-z0-9]{3}|(?:rgb\(\s*(?:[+-]?\d+%?)\s*,\s*(?:[+-]?\d+%?)\s*,\s*(?:[+-]?\d+%?)\s*\))aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow$/i,
  'host-name': /^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])/,
  'url': /^(https?|ftp|git):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i,
  'regex': {
    test: function test(value) {
      try {
        new RegExp(value);
      } catch (e) {
        return false;
      }

      return true;
    }
  }
};

function formatRule(value, format) {
  if (!isDefined(value)) {
    return true;
  }

  if (!FORMATS[format]) {
    throw new Error('Unknown format "' + format + '"');
  }

  return FORMATS[format].test(value);
}

registerRule('format', formatRule, 'is not a valid %{expected}');

function matchToRule(value, matchTo) {
  if (!isDefined(value)) {
    return true;
  }

  return value === matchTo;
}

registerRule('matchTo', matchToRule, '%{actual} should match to %{expected}');

function matchToPropertyRule(value, matchToProperty, obj) {
  if (!isDefined(value)) {
    return true;
  }

  return value === obj[matchToProperty];
}

registerRule('matchToProperty', matchToPropertyRule, '%{actual} should match to %{expected}');

function notMatchToRule(value, notMatchTo) {
  if (!isDefined(value)) {
    return true;
  }

  if (!isArray(notMatchTo)) {
    notMatchTo = [notMatchTo];
  }

  return notMatchTo.every(function (not) {
    return not !== value;
  });
}

registerRule('notMatchTo', notMatchToRule, '%{actual} should not match to %{expected}');

function notMatchToPropertiesRule(value, notMatchToProperties, obj) {
  if (!isDefined(value)) {
    return true;
  }

  if (!isArray(notMatchToProperties)) {
    notMatchToProperties = [notMatchToProperties];
  }

  return notMatchToProperties.every(function (not) {
    return obj[not] !== value;
  });
}

registerRule('notMatchToProperties', notMatchToPropertiesRule, '%{actual} should not match to %{expected}');

function maxRule(value, max) {
  if (!isDefined(value)) {
    return true;
  }

  return value <= max;
}

registerRule('max', maxRule, 'must be less than or equal to %{expected}');

function maxItemsRule(value, minItems) {
  if (!isDefined(value)) {
    return true;
  }

  return isArray(value) && value.length <= minItems;
}

registerRule('maxItems', maxItemsRule, 'must contain less than %{expected} items');

function maxLengthRule(value, maxLength) {
  if (!isDefined(value)) {
    return true;
  }

  return value.length <= maxLength;
}

registerRule('maxLength', maxLengthRule, 'is too long (maximum is %{expected} characters)');

function exclusiveMaxRule(value, exclusiveMax) {
  if (!isDefined(value)) {
    return true;
  }

  return value < exclusiveMax;
}

registerRule('exclusiveMax', exclusiveMaxRule, 'must be less than %{expected}');

function minRule(value, min) {
  if (!isDefined(value)) {
    return true;
  }

  return value >= min;
}

registerRule('min', minRule, 'must be greater than or equal to %{expected}');

function minItemsRule(value, minItems) {
  if (!isDefined(value)) {
    return true;
  }

  return isArray(value) && value.length >= minItems;
}

registerRule('minItems', minItemsRule, 'must contain more than %{expected} items');

function minLengthRule(value, minLength) {
  if (!isDefined(value)) {
    return true;
  }

  return value.length >= minLength;
}

registerRule('minLength', minLengthRule, 'is too short (minimum is %{expected} characters)');

function exclusiveMinRule(value, exclusiveMin) {
  if (!isDefined(value)) {
    return true;
  }

  return value > exclusiveMin;
}

registerRule('exclusiveMin', exclusiveMinRule, 'must be greater than %{expected}');

function patternRule(value, pattern) {
  if (!isDefined(value)) {
    return true;
  }

  pattern = isString(pattern) ? new RegExp(pattern) : pattern;

  return pattern.test(value);
}

registerRule('pattern', patternRule, 'invalid input');

function requiredRule(value, required) {
  if (value) {
    return true;
  }

  if (isBoolean(required)) {
    return !required;
  }

  if (isObject(required)) {
    var allowEmpty = required.allowEmpty;
    var allowZero = required.allowZero;


    if (isBoolean(allowEmpty)) {
      return allowEmpty && value === '';
    }

    if (isBoolean(allowZero)) {
      return allowZero && value === 0;
    }
  }

  return isDefined(value);
}

registerRule('required', requiredRule, 'is required');

function checkValueType(value, type) {
  switch (type) {
    case 'boolean':
      return isBoolean(value);

    case 'number':
      return isNumber(value);

    case 'string':
      return isString(value);

    case 'date':
      return isDate(value);

    case 'object':
      return isObject(value);

    case 'array':
      return isArray(value);

    default:
      return true;
  }
}

function typeRule(value, type) {
  if (!isDefined(value)) {
    return true;
  }

  var types = type;

  if (!Array.isArray(type)) {
    types = [type];
  }

  return types.some(function (type) {
    return checkValueType(value, type);
  });
}

registerRule('type', typeRule, 'must be of %{expected} type');

function uniqueItemsRule(value, uniqueItems) {
  if (!isDefined(value)) {
    return true;
  }

  if (!uniqueItems) {
    return true;
  }

  var hash = {};

  for (var i = 0, l = value.length; i < l; i++) {
    var key = JSON.stringify(value[i]);
    if (hash[key]) {
      return false;
    }

    hash[key] = true;
  }

  return true;
}

registerRule('uniqueItems', uniqueItemsRule, 'must hold a unique set of values');

export { isType, isObject, isArray, isFunction, isString, isDate, isNumber, isBoolean, isDefined, noop, getObjectOverride, handlePromise, handlePromises, formatMessage, registerRule, hasRule, getRule, overrideRule, overrideRuleMessage, validateRule, validateRuleSync, validateValue, validateValueSync, validateProperty, validatePropertySync, validateArray, validateArraySync, validateObject, validateObjectSync, validate, validateSync, ValidationSchema, ValidationResult, divisibleByRule, enumRule, formatRule, matchToRule, matchToPropertyRule, notMatchToRule, notMatchToPropertiesRule, maxRule, maxItemsRule, maxLengthRule, exclusiveMaxRule, minRule, minItemsRule, minLengthRule, exclusiveMinRule, patternRule, requiredRule, typeRule, uniqueItemsRule };
//# sourceMappingURL=valirator.es6.map
