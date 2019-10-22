#pragma once

#include <iostream>
#include <algorithm>
#include <functional>
#include <cctype>
#include <locale>

extern "C" {
    int __NITORI_HIJACK_MAIN__(int argc, char** argv);
}

#define MULTILINE(...) #__VA_ARGS__

namespace nitori {

namespace util {

/**
 * Trim string from start
 */
static inline std::string ltrim(std::string s) {
    s.erase(s.begin(), std::find_if(s.begin(), s.end(),
            std::not1(std::ptr_fun<int, int>(std::isspace))));
    return s;
}

/**
 * Trim string from end
 */
static inline std::string rtrim(std::string s) {
    s.erase(std::find_if(s.rbegin(), s.rend(),
            std::not1(std::ptr_fun<int, int>(std::isspace))).base(), s.end());
    return s;
}

/**
 * Trim string from both ends
 */
static inline std::string trim(std::string s) {
    return ltrim(rtrim(s));
}

}

namespace internal {

std::stringstream stdout;
std::stringstream stderr;
std::stringstream stdin;

std::streambuf _stdout;
std::streambuf _stderr;
std::streambuf _stdin;

}

/**
 * Replace std::cout with our stringstream
 */
static inline void hijack_stdout() {
    internal::stdout.str("");
    std::cout.rdbuf(internal::stdout.rdbuf());
}

/**
 * Replace std::cerr with our stringstream
 */
static inline void hijack_stderr() {
    internal::stderr.str("");
    std::cerr.rdbuf(internal::stderr.rdbuf());
}

/**
 * Replace std::cin with our stringstream
 */
static inline void hijack_stdin(std::string value) {
    internal::stdin.str(value);
    std::cin.rdbuf(internal::stdin.rdbuf());
}

/**
 * Get std::cout
 * @param trim Trim return value? True by default
 */
static inline std::string stdout(bool trim = true) {
    return trim ? util::trim(internal::stdout.str()) : internal::stdout.str();
}

/**
 * Get std::cerr
 * @param trim Trim return value? True by default
 */
static inline std::string stderr(bool trim = true) {
    return trim ? util::trim(internal::stderr.str()) : internal::stderr.str();
}

/**
 * Get std::cin
 * @param trim Trim return value? True by default
 */
static inline std::string stdin(bool trim = true) {
    return trim ? util::trim(internal::stdin.str()) : internal::stdin.str();
}

/**
 * Set std::cin
 */
static inline std::string stdin(std::string value) {
    hijack_stdin(value);
}

/**
 * Call hijacked main
 */
static inline int call_main(int argc, char** argv) {
    __NITORI_HIJACK_MAIN__(argc, argv);
}

}