#include <iostream>

int main(){
    std::string s(std::istreambuf_iterator<char>(std::cin), {});
    std::cout << s;
}