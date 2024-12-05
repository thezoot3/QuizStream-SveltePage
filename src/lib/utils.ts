export function constantDigit(num: number, digit: number) {
	return num.toString().padStart(digit, '0');
}
