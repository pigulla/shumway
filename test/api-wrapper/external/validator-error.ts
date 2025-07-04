// Mapping an error that we defined and threw ourselves in the first place is rather pointless. But
// in a real project this would typically be defined inside a library, like ValidationError from the
// class-validator package (https://github.com/typestack/class-validator).

export class ValidatorError extends Error {
    public override name = 'ValidatorError'
}
