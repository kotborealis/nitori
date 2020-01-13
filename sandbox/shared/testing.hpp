#pragma once

#define CATCH_CONFIG_MAIN
#include "catch.hpp"

#include <iostream>
#include <fstream>

#include <algorithm>
#include <vector>
#include <functional>
#include <cctype>
#include <locale>

#include <cstdio>

extern "C" {
    int __NITORI_HIJACK_MAIN__(int argc, char** argv);
}

#define MULTILINE(...) #__VA_ARGS__

namespace nitori {

namespace util {

/**
 * Trim string from start
 *
 * @param s String
 */
static inline std::string ltrim(std::string s) {
    s.erase(s.begin(), std::find_if(s.begin(), s.end(),
            std::not1(std::ptr_fun<int, int>(std::isspace))));
    return s;
}

/**
 * Trim string from end
 *
 * @param s String
 */
static inline std::string rtrim(std::string s) {
    s.erase(std::find_if(s.rbegin(), s.rend(),
            std::not1(std::ptr_fun<int, int>(std::isspace))).base(), s.end());
    return s;
}

/**
 * Trim string from both ends
 *
 * @param s String
 */
static inline std::string trim(std::string s) {
    return ltrim(rtrim(s));
}

/**
 * Read file into string
 * @param filename Path to file
 */
static inline std::string readFile(std::string filename) {
    std::ifstream file(filename);
    std::string content((std::istreambuf_iterator<char>(file)),
             std::istreambuf_iterator<char>());
    file.close();
    return content;
}

/**
 * Write string into file
 *
 * @param filename Path to file
 * @param content Data to write
 */
static inline void writeFile(std::string filename, std::string content) {
    std::ofstream file(filename);
    file << content;
    file.close();
}

}

/**
 * Hijack stdout
 */
static inline void hijack_stdout() {
    freopen(".stdout", "w", stdout);
}

/**
 * Restore stdout
 */
static inline void restore_stdout() {
    freopen("/dev/tty", "w", stdout);
}

/**
 * Hijack stderr
 */
static inline void hijack_stderr() {
    freopen(".stderr", "w", stderr);
}

/**
 * Restore stderr
 */
static inline void restore_stderr() {
    freopen("/dev/tty", "w", stderr);
}

/**
 * Hijack stdin
 *
 * @param value stdin value
 */
static inline void hijack_stdin(std::string value = "") {
    freopen(".stdin", "w", stdin);
    fprintf(stdin, value.c_str());
    freopen(".stdin", "r", stdin);
}

/**
 * Restore stdin
 */
static inline void restore_stdin() {
    freopen("/dev/tty", "r", stdin);
}

/**
 * Get stdout
 * @param trim Trim return value? True by default
 */
static inline std::string stdout(bool trim = true) {
    auto content = util::readFile(".stdout");
    return trim ? util::trim(content) : content;
}

/**
 * Get stderr
 * @param trim Trim return value? True by default
 */
static inline std::string stderr(bool trim = true) {
    auto content = util::readFile(".stderr");
    return trim ? util::trim(content) : content;
}

/**
 * Get stdin
 * @param trim Trim return value? True by default
 */
static inline std::string stdin(bool trim = true) {
    auto content = util::readFile(".stdin");
    return trim ? util::trim(content) : content;
}

/**
 * Hijack stdin alias
 *
 * @param value stdin value
 */
static inline std::string stdin(std::string value = "") {
    hijack_stdin(value);
}

/**
 * Call hijacked main with classic argc & argv
 * Automaticly hijacks and restores stdout and stderr
 *
 * @param argc
 * @param argv
 */
static inline int main(int argc, char** argv) {
    nitori::hijack_stdout();
    __NITORI_HIJACK_MAIN__(argc, argv);
    nitori::restore_stdout();
    nitori::restore_stdin();
}

/**
 * Call hijacked main with vector args and default program name
 * Automaticly hijacks and restores stdout and stderr
 *
 * @param args Vector with arguments, except argv[0] (program name)
 */
static inline int main(std::vector<char*> args) {
    args.insert(args.begin(), "hijacked_main_call");

    int argc = args.size();
    char **argv = &args[0];

    ::nitori::main(argc, argv);
}

/**
 * Call hijacked main without args
 * Automaticly hijacks and restores stdout and stderr
 */
static inline int main() {
    ::nitori::main({});
}

}
