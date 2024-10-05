function printJsonRecursively(obj, indent = '') {
    if (typeof obj !== 'object' || obj === null) {
        console.info(`${indent}${obj}`);
        return;
    }

    if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
            console.info(`${indent}[${index}]:`);
            printJsonRecursively(item, indent + '  ');
        });
    } else {
        Object.keys(obj).forEach(key => {
            console.info(`${indent}${key}:`);
            printJsonRecursively(obj[key], indent + '  ');
        });
    }
}
