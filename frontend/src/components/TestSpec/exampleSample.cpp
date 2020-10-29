// Код примера для теста

#include <stdio.h>
#include <filesystem>

int sum(int a, int b) {
    return a + b;
}

int sumAndPrint(int a, int b) {
    printf("%d\n", a + b);
    return a + b;
}

void sumAndPrintVoid(int a, int b) {
    printf("\t\t\t%d   \n", a + b);
}

int main(int argc, char** argv){
    printf("Hello, world!\n");

    std::filesystem::copy(argv[1], argv[2]);

    return 0;
}