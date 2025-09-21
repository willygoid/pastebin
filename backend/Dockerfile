# build stage
FROM golang:1.21-alpine AS build
WORKDIR /app
ENV CGO_ENABLED=0

# copy mod dan download deps
#COPY go.mod ./
#RUN go mod download

# copy source
COPY . .
RUN go build -ldflags="-s -w" -o /app/bin/app ./app/main.go

# production stage
FROM alpine:3.18
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=build /app/bin/app /app/app
EXPOSE 8080
CMD ["/app/app"]
