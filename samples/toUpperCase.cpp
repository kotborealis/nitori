#include <cstring>
#include <cctype>

const char* toUpperCase(const char* str) {
	char* res = new char[strlen(str)];

	int i;
	for(i = 0; i < strlen(str); i++)
		res[i] = std::toupper(str[i]);

	res[i] = '\0';

	return res;
}