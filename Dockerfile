FROM alpine:3.11

RUN apk --no-cache --update add git curl

RUN wget -O - -q https://raw.githubusercontent.com/reviewdog/reviewdog/master/install.sh | sh -s -- -b /usr/local/bin/

RUN curl -sSLO https://github.com/realm/SwiftLint/releases/download/0.39.2/portable_swiftlint.zip \
    && unzip portable_swiftlint.zip \
    && chmod a+x swiftlint \
    && mv swiftlint /usr/local/bin/

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
