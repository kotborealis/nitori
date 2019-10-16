#pragma once

#include <iostream>
#include <algorithm>
#include <functional>
#include <cctype>
#include <locale>

namespace nitori {

std::stringstream stdout;
std::stringstream stderr;
std::stringstream stdin;

// trim from start
static inline std::string ltrim(std::string s) {
    s.erase(s.begin(), std::find_if(s.begin(), s.end(),
            std::not1(std::ptr_fun<int, int>(std::isspace))));
    return s;
}

// trim from end
static inline std::string rtrim(std::string s) {
    s.erase(std::find_if(s.rbegin(), s.rend(),
            std::not1(std::ptr_fun<int, int>(std::isspace))).base(), s.end());
    return s;
}

// trim from both ends
static inline std::string trim(std::string s) {
    return ltrim(rtrim(s));
}

}

#define HIJACK_STDOUT( )        do { \
                                    nitori::stdout.str(""); \
                                    std::cout.rdbuf(nitori::stdout.rdbuf()); \
                                } while(0)

#define HIJACK_STDERR( )        do { \
                                    nitori::stderr.str(""); \
                                    std::cerr.rdbuf(nitori::stderr.rdbuf()); \
                                } while(0)

#define HIJACK_STDIN( INPUT )   do { \
                                    nitori::stdin.str(INPUT); \
                                    std::cin.rdbuf(nitori::stdin.rdbuf()); \
                                } while(0)

extern "C" {
    int __HIJACK_MAIN__(int argc, char** argv);
}

#define HIJACK_MAIN __HIJACK_MAIN__