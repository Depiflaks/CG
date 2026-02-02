cmake_minimum_required(VERSION 3.10)
project(lab1_initials)

set(CMAKE_CXX_STANDARD 20)

#set(FONT_FILE
#        ${CMAKE_SOURCE_DIR}/assets/DejaVuSans.ttf
#)
#
#set(FONT_DST
#        $<TARGET_FILE_DIR:${PROJECT_NAME}>/assets/fonts
#)
#
#add_custom_command(
#        TARGET ${PROJECT_NAME}
#        POST_BUILD
#        COMMAND ${CMAKE_COMMAND} -E make_directory ${FONT_DST}
#        COMMAND ${CMAKE_COMMAND} -E copy_if_different
#        ${FONT_FILE}
#        ${FONT_DST}/DejaVuSans.ttf
#)

file(GLOB_RECURSE PROJECT_SOURCES CONFIGURE_DEPENDS
        src/*.cpp
        src/*.h
)

add_executable(${PROJECT_NAME} ${PROJECT_SOURCES})

target_include_directories(${PROJECT_NAME} PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/src)

list(FILTER PROJECT_SOURCES EXCLUDE REGEX ".*main\\.cpp$")

target_link_libraries(${PROJECT_NAME} PRIVATE
        sfml-graphics
        sfml-window
        sfml-system
        sfml-audio
        sfml-network
)
